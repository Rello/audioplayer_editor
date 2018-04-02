<?php
/**
 * Audio Player Tag Editor
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

namespace OCA\audioplayer_editor\AppInfo;

use \OCA\audioplayer_editor\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, ['routes' => [
	['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	['name' => 'editor#editAudioFile', 'url' => '/editaudiofile', 'verb' => 'GET'],
	['name' => 'editor#saveAudioFileData', 'url' => '/saveaudiofiledata', 'verb' => 'POST'],
    ['name' => 'editor#saveMetaData', 'url' => '/savemetadata', 'verb' => 'POST'],
	]]);
