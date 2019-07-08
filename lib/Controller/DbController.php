<?php
/**
 * Audio Player Editor
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2019 Marcel Scherello
 */

namespace OCA\audioplayer_editor\Controller;

use OCP\AppFramework\Controller;
use OCP\IRequest;
use OCP\IL10N;
use OCP\IDbConnection;
use OCP\Share\IManager;
use OCP\ILogger;
use OCP\ITagManager;

/**
 * Controller class for main page.
 */
class DbController extends Controller
{

    private $userId;
    private $l10n;
    private $db;
    private $shareManager;
    private $tagManager;
    private $logger;

    public function __construct(
        $appName,
        IRequest $request,
        $userId,
        IL10N $l10n,
        IDbConnection $db,
        ITagManager $tagManager,
        IManager $shareManager,
        ILogger $logger
    )
    {
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->l10n = $l10n;
        $this->db = $db;
        $this->shareManager = $shareManager;
        $this->tagManager = $tagManager;
        $this->logger = $logger;
    }

    /**
     * Add album to db if not exist
     * @param int $userId
     * @param string $sAlbum
     * @param string $sYear
     * @param int $iArtistId
     * @param int $parentId
     * @return array
     * @throws \Doctrine\DBAL\DBALException
     */
    public function writeAlbumToDB($userId, $sAlbum, $sYear, $iArtistId, $parentId)
    {
        $sAlbum = $this->truncate($sAlbum, '256');
        $sYear = $this->normalizeInteger($sYear);
        $AlbumCount = 0;

        $stmt = $this->db->prepare('SELECT `id`, `artist_id` FROM `*PREFIX*audioplayer_albums` WHERE `user_id` = ? AND `name` = ? AND `folder_id` = ?');
        $stmt->execute(array($userId, $sAlbum, $parentId));
        $row = $stmt->fetch();
        if ($row) {
            if ((int)$row['artist_id'] !== (int)$iArtistId) {
                $various_id = $this->writeArtistToDB($userId, $this->l10n->t('Various Artists'));
                $stmt = $this->db->prepare('UPDATE `*PREFIX*audioplayer_albums` SET `artist_id`= ? WHERE `id` = ? AND `user_id` = ?');
                $stmt->execute(array($various_id, $row['id'], $userId));
            }
            $insertid = $row['id'];
        } else {
            $stmt = $this->db->prepare('INSERT INTO `*PREFIX*audioplayer_albums` (`user_id`,`name`,`folder_id`) VALUES(?,?,?)');
            $stmt->execute(array($userId, $sAlbum, $parentId));
            $insertid = $this->db->lastInsertId('*PREFIX*audioplayer_albums');
            if ($iArtistId) {
                $stmt = $this->db->prepare('UPDATE `*PREFIX*audioplayer_albums` SET `year`= ?, `artist_id`= ? WHERE `id` = ? AND `user_id` = ?');
                $stmt->execute(array((int)$sYear, $iArtistId, $insertid, $userId));
            } else {
                $stmt = $this->db->prepare('UPDATE `*PREFIX*audioplayer_albums` SET `year`= ? WHERE `id` = ? AND `user_id` = ?');
                $stmt->execute(array((int)$sYear, $insertid, $userId));
            }
            $AlbumCount = 1;
        }

        $return = [
            'id' => $insertid,
            'state' => true,
            'albumcount' => $AlbumCount,
        ];
        return $return;
    }

    /**
     * truncates fiels do DB-field size
     *
     * @param $string
     * @param $length
     * @param $dots
     * @return string
     */
    private function truncate($string, $length, $dots = "...")
    {
        return (strlen($string) > $length) ? mb_strcut($string, 0, $length - strlen($dots)) . $dots : $string;
    }

    /**
     * validate unsigned int values
     *
     * @param string $value
     * @return int value
     */
    private function normalizeInteger($value)
    {
        // convert format '1/10' to '1' and '-1' to null
        $tmp = explode('/', $value);
        $tmp = explode('-', $tmp[0]);
        $value = $tmp[0];
        if (is_numeric($value) && ((int)$value) > 0) {
            $value = (int)$value;
        } else {
            $value = 0;
        }
        return $value;
    }

    /**
     * Add artist to db if not exist
     * @param int $userId
     * @param string $sArtist
     * @return int
     */
    public function writeArtistToDB($userId, $sArtist)
    {
        $sArtist = $this->truncate($sArtist, '256');

        $stmt = $this->db->prepare('SELECT `id` FROM `*PREFIX*audioplayer_artists` WHERE `user_id` = ? AND `name` = ?');
        $stmt->execute(array($userId, $sArtist));
        $row = $stmt->fetch();
        if ($row) {
            return $row['id'];
        } else {
            $stmt = $this->db->prepare('INSERT INTO `*PREFIX*audioplayer_artists` (`user_id`,`name`) VALUES(?,?)');
            $stmt->execute(array($userId, $sArtist));
            $insertid = $this->db->lastInsertId('*PREFIX*audioplayer_artists');
            return $insertid;
        }
    }

    /**
     * Add genre to db if not exist
     * @param int $userId
     * @param string $sGenre
     * @return int
     */
    public function writeGenreToDB($userId, $sGenre)
    {
        $sGenre = $this->truncate($sGenre, '256');

        $stmt = $this->db->prepare('SELECT `id` FROM `*PREFIX*audioplayer_genre` WHERE `user_id` = ? AND `name` = ?');
        $stmt->execute(array($userId, $sGenre));
        $row = $stmt->fetch();
        if ($row) {
            return $row['id'];
        } else {
            $stmt = $this->db->prepare('INSERT INTO `*PREFIX*audioplayer_genre` (`user_id`,`name`) VALUES(?,?)');
            $stmt->execute(array($userId, $sGenre));
            $insertid = $this->db->lastInsertId('*PREFIX*audioplayer_genre');
            return $insertid;
        }
    }

    /**
     * Get file id for single track
     * @param int $trackId
     * @return int
     */
    public function getFileId($trackId)
    {
        $SQL = "SELECT `file_id` FROM `*PREFIX*audioplayer_tracks` WHERE  `user_id` = ? AND `id` = ?";
        $stmt = $this->db->prepare($SQL);
        $stmt->execute(array($this->userId, $trackId));
        $row = $stmt->fetch();
        return $row['file_id'];
    }

    /**
     * Add track to db if not exist
     * @param int $userId
     * @param int $track_id
     * @param string $editKey
     * @param string $editValue
     * @return bool
     */
    public function updateTrack($userId, $track_id, $editKey, $editValue)
    {
        $SQL = 'UPDATE `*PREFIX*audioplayer_tracks` SET `' . $editKey . '` = ? WHERE `user_id` = ? AND `id` = ?';
        $stmt = $this->db->prepare($SQL);
        $stmt->execute(array($editValue,
            $userId,
            $track_id
        ));
        return true;
    }

}
