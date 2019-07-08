<?php
/**
 * Audio Player Tag Editor
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
use OCP\L10N\IFactory;
use OCP\IDbConnection;
use OCP\Files\IRootFolder;
use \OC\Files\View; //remove when editAudioFiles is updated and toTmpFile alternative
use OCP\ILogger;

/**
 * Controller class for main page.
 */
class EditorController extends Controller {
	
	private $userId;
	private $l10n;
	private $db;
	private $languageFactory;
	private $rootFolder;
    private $logger;
    private $DBController;
		public function __construct(
			$appName, 
			IRequest $request, 
			$userId, 
			IL10N $l10n, 
			IDbConnection $db, 
			IFactory $languageFactory,
			IRootFolder $rootFolder,
            DbController $DBController,
            ILogger $logger
        ) {
		parent::__construct($appName, $request);
		$this->appName = $appName;
		$this->userId = $userId;
		$this->l10n = $l10n;
		$this->db = $db;
		$this->languageFactory = $languageFactory;
		$this->rootFolder = $rootFolder;
		$this->logger = $logger;
		$this->DBController = $DBController;
	}

    /**
     * Save meta data in database
     * @param int $trackid
     * @param string $editKey
     * @param string $editValue
     * @return bool
     */
    public function saveMetaData($trackid, $editKey, $editValue)
    {

        $directEditArray = ['Title' => 'title', 'Genre' => '', 'Subtitle' => 'subtitle', 'Year' => 'year', 'Album' => '', 'Artist' => '', 'Disc' => 'disc', 'Track' => 'number'];
        $updateKey = $directEditArray[$editKey];

        if ($editKey === 'Genre' AND $editValue !== '') {
            $editValue = $this->DBController->writeGenreToDB($this->userId, $editValue);
            $updateKey = 'genre_id';
        }
        if ($editKey === 'Artist' AND $editValue !== '') {
            $editValue = $this->DBController->writeArtistToDB($this->userId, $editValue);
            $updateKey = 'artist_id';
        }

        if ($updateKey !== '' AND $editValue !== ''){
            $this->DBController->updateTrack($this->userId, $trackid, $updateKey, $editValue);
            //$this->DBController->cleanupDb($this->userId);
            //return $this->updateFileMetaData($trackid, $updateKey, $editValue);
            return true;
        }
        return false;
    }

    /**
     * Save meta data to file. not working yet
     * @param int $trackid
     * @param string $editKey
     * @param string $editValue
     * @return array
     */
    private function updateFileMetaData($trackid, $editKey, $editValue)
    {
        $fileId = $this->DBController->getFileId($trackid);
        if (!class_exists('getid3_exception')) {
            require_once __DIR__ . '/../../3rdparty/getid3/getid3.php';
        }
        require_once __DIR__ . '/../../3rdparty/getid3/write.php';

        $userView = new View('/' . $this->userId . '/files');
        $path = $userView->getPath($fileId);
        $this->logger->debug('Section 2: ' . $fileId . ' Path : ' . $path, array('app' => 'audioplayer'));

        if (\OC\Files\Filesystem::isUpdatable($path)) {

            $tagWriter = new \getid3_writetags;
            $localFile = $userView->getLocalFile($path);
            $this->logger->debug('Updating following file: ' . $localFile, array('app' => 'audioplayer'));
            $tagWriter->filename = $localFile;
            $tagWriter->tagformats = array('id3v2.3');
            $tagWriter->overwrite_tags = false;
            $tagWriter->tag_encoding = 'UTF-8';

            $resultData = [
                $editKey => [$editValue]
            ];
            $resultData = $tagWriter->tag_data = $resultData;
            $tagWriter->WriteTags();

            if (count($tagWriter->errors)) {
                $this->logger->debug('errors: ' . print_r($tagWriter->errors), array('app' => 'audioplayer'));
                $result = [
                    'status' => 'errors',
                    'msg' => print_r($tagWriter->errors),
                ];
            } elseif (count($tagWriter->warnings)) {
                $this->logger->debug('errors: ' . print_r($tagWriter->warnings), array('app' => 'audioplayer'));
                $result = [
                    'status' => 'warnings',
                    'msg' => (string)$tagWriter->warnings,
                ];
            } else {
                $result = [
                    'status' => 'success',
                    'data' => $resultData,
                ];
            }
        } else {
            $result = [
                'status' => 'error_write',
                'msg' => 'not writeable',
            ];
        }

        //$response = new JSONResponse();
        //$response -> setData($result);
        return $result;

    }
}
