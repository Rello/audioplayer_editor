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

namespace OCA\audioplayer_editor\AppInfo;

use OCP\Util;

\OC::$server->getEventDispatcher()->addListener('OCA\audioplayer::loadAdditionalScripts', function () {
    Util::addScript('audioplayer_editor', 'editor');
    Util::addStyle('audioplayer_editor', 'editor');
}
);