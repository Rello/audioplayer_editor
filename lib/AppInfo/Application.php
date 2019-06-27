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

namespace OCA\audioplayer_editor\AppInfo;

use OCP\AppFramework\App;
use OCP\IContainer;

class Application extends App {

	public function __construct(array $urlParams = array()) {

		parent::__construct('audioplayer_editor', $urlParams);
		$container = $this->getContainer();

		$container->registerService(
			'URLGenerator', function(IContainer $c) {
				$server = $c->query('ServerContainer');
				return $server->getURLGenerator();
			}
		);

		$container->registerService(
			'UserId', function() {
				$user = \OC::$server->getUserSession()->getUser();
				if ($user) {
					return $user->getUID();
				}
			}
		);

		$container->registerService(
			'L10N', function(IContainer $c) {
				return $c->query('ServerContainer')
					 ->getL10N($c->query('AppName'));
			}
		);

		$container->registerService(
			'Config', function(IContainer $c) {
				return $c->getServer()->getConfig();
			}
		);
	}
}
