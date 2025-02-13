<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * unilabel module.
 *
 * @package     mod_unilabel
 * @author      Andreas Grabs <info@grabs-edv.de>
 * @copyright   2018 onwards Grabs EDV {@link https://www.grabs-edv.de}
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_unilabel;

/**
 * Create a instance of a content type.
 * @package     mod_unilabel
 * @author      Andreas Grabs <info@grabs-edv.de>
 * @copyright   2018 onwards Grabs EDV {@link https://www.grabs-edv.de}
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class factory {
    /**
     * Get a list of names from all content type plugins.
     *
     * @return array
     */
    public static function get_plugin_list() {
        $plugins = self::get_plugins();

        $return = [];
        foreach ($plugins as $name => $plugin) {
            $return[$name] = $plugin->get_name();
        }

        return $return;
    }

    /**
     * Get all content type plugins.
     *
     * @return array
     */
    public static function get_plugins() {
        $plugins = \core_component::get_plugin_list('unilabeltype');

        $return = [];
        foreach ($plugins as $name => $notused) {
            $plugin = self::get_plugin($name);
            if (!$plugin->is_active()) {
                continue;
            }
            $return[$name] = $plugin;
        }

        return $return;
    }

    /**
     * Get a content type plugin by a given name.
     *
     * @param  string       $name
     * @return content_type
     */
    public static function get_plugin($name): content_type {
        $classname = '\\unilabeltype_' . $name . '\\content_type';
        if (!class_exists($classname)) {
            $classname = '\mod_unilabel\unknown_type';
        }

        return new $classname();
    }

    /**
     * Delete the content of the current content type.
     *
     * @param  int  $unilabelid
     * @return void
     */
    public static function delete_plugin_content($unilabelid) {
        $plugins = self::get_plugins();
        foreach ($plugins as $plugin) {
            $plugin->delete_content($unilabelid);
        }
    }

    /**
     * Adds an edit info element to the given MoodleQuickForm.
     *
     * This function retrieves the edit info for the specified content type plugin,
     * creates a group containing an HTML element with the edit info, and adds the group
     * to the form. It also hides the group if the content type does not match the specified type.
     *
     * @param string $type The content type for which to retrieve the edit info.
     * @param \MoodleQuickForm $mform The MoodleQuickForm to which to add the edit info element.
     *
     * @return void
     */
    public static function add_edit_info_element(string $type, \MoodleQuickForm $mform) {
        global $OUTPUT;

        $plugin = static::get_plugin($type);
        if (!$infotext = $plugin->get_edit_info()) {
            return; // No edit info available for this type.
        }
        $groupname = 'edit_info_' . $type;
        $group = [];
        $group[] = $mform->createElement(
            'html',
            $OUTPUT->render(new \mod_unilabel\output\component\edit_info(
                $plugin->get_namespace(),
                $infotext)
            )
        );
        $mform->addGroup($group, $groupname, '', '');
        $mform->hideIf($groupname, 'unilabeltype', 'neq', $type);
    }

    /**
     * Save the content for the current content type plugin.
     *
     * @param  \stdClass $formdata
     * @param  \stdClass $unilabel
     * @return bool
     */
    public static function save_plugin_content($formdata, $unilabel) {
        $unilabeltype = self::get_plugin($unilabel->unilabeltype);

        if ($unilabeltype->save_content($formdata, $unilabel)) {
            return true;
        }

        return false;
    }
}
