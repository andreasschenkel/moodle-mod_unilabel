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
 * mod_unilabel
 *
 * @package     mod_unilabel
 * @author      Andreas Grabs <info@grabs-edv.de>
 * @copyright   2018 onwards Grabs EDV {@link https://www.grabs-edv.de}
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_unilabel\output;

/**
 * Content type definition.
 * @package     mod_unilabel
 * @author      Andreas Grabs <info@grabs-edv.de>
 * @copyright   2018 onwards Grabs EDV {@link https://www.grabs-edv.de}
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class edit_element_base implements \templatable, \renderable {

    /** @var \stdClass */
    protected $data;

    /** @var \stdClass */
    protected $course;
    /** @var string */
    protected $formid;
    /** @var string */
    protected $context;
    /** @var string */
    protected $type;
    /** @var string */
    protected $prefix;
    /** @var string */
    protected $component;
    /** @var int */
    protected $repeatindex;
    /** @var \core_renderer */
    protected $output;

    /**
     * Constructor
     *
     * @param string $formid The id the edit_content form (mform) is using
     * @param \context $context The context of the cm
     * @param \stdClass $course
     * @param string $type The unilabel type like "grid" or "carousel"
     * @param int $repeatindex
     */
    public function __construct(string $formid, \context $context, \stdClass $course, string $type, int $repeatindex) {
        global $CFG, $OUTPUT;

        require_once($CFG->libdir . '/formslib.php');
        require_once($CFG->libdir . '/form/filemanager.php');
        require_once($CFG->libdir . '/form/editor.php');
        require_once($CFG->libdir . '/form/text.php');
        require_once($CFG->libdir . '/form/hidden.php');
        require_once($CFG->libdir . '/form/header.php');
        require_once($CFG->libdir . '/form/static.php');

        // Set the global properties.
        $this->output = $OUTPUT;
        $this->formid = $formid;
        $this->context = $context;
        $this->course = $course;
        $this->type = $type;
        $this->component = 'unilabeltype_' . $type;
        $this->prefix = $this->component . '_';
        $this->repeatindex = $repeatindex;

        // Set the common values for the output array.
        $this->data = new \stdClass();
        $this->data->formid = $this->formid;
        $this->data->type = $this->type;
        $this->data->repeatindex = $this->repeatindex;
        $this->data->prefix = $this->prefix;
        $this->data->repeatnr = $this->repeatindex + 1;

    }

    /**
     * Get an mform filemanager element as html fragment.
     *
     * @param string $name The element name without the prefix.
     * @param array $attributes
     * @param array $options The options for file handling
     * @param string $helpbutton
     * @return string The html fragment
     */
    protected function get_filemanager(string $name, array $attributes = [], array $options = [], $helpbutton = '') {
        $elementname = $this->prefix . $name . '[' . $this->repeatindex . ']';
        $attributes['id'] = 'id_' . $this->prefix . $name . '_' . $this->repeatindex;
        $attributes['name'] = $elementname;

        $label = get_string($name, $this->component) . '-' . ($this->repeatindex + 1);

        $element = new \MoodleQuickForm_filemanager($elementname, $label, $attributes, $options);
        if ($helpbutton) {
            $element->_helpbutton = $this->output->help_icon($helpbutton, $this->component);
        }

        return $this->output->mform_element($element, false, false, '', false);
    }

    /**
     * Get an mform editor element as html fragment.
     *
     * @param string $name The element name without the prefix.
     * @param array $attributes
     * @param array $options The options for file handling
     * @param boolean $helpbutton
     * @return string The html fragment
     */
    protected function get_editor(string $name, array $attributes = [], array $options = [], $helpbutton = '') {
        $elementname = $this->prefix . $name . '[' . $this->repeatindex . ']';
        $attributes['id'] = 'id_' . $this->prefix . $name . '_' . $this->repeatindex;
        $attributes['name'] = $elementname;

        $label = get_string($name, $this->component) . '-' . ($this->repeatindex + 1);

        $element = new \MoodleQuickForm_editor($elementname, $label, $attributes, $options);
        if ($helpbutton) {
            $element->_helpbutton = $this->output->help_icon($helpbutton, $this->component);
        }

        return $this->output->mform_element($element, false, false, '', false);
    }

    /**
     * Get an mform text element as html fragment.
     *
     * @param string $name The element name without the prefix.
     * @param array $attributes
     * @param boolean $helpbutton
     * @return string The html fragment
     */
    protected function get_textfield(string $name, array $attributes = [], $helpbutton = '') {
        $elementname = $this->prefix . $name . '[' . $this->repeatindex . ']';
        $attributes['id'] = 'id_' . $this->prefix . $name . '_' . $this->repeatindex;
        $attributes['name'] = $elementname;

        $label = get_string($name, $this->component) . '-' . ($this->repeatindex + 1);

        $element = new \MoodleQuickForm_text($elementname, $label, $attributes);
        if ($helpbutton) {
            $element->_helpbutton = $this->output->help_icon($helpbutton, $this->component);
        }

        return $this->output->mform_element($element, false, false, '', false);
    }

    /**
     * Get an mform hidden element as html fragment.
     *
     * @param string $name The element name without the prefix.
     * @return string The html fragment
     */
    protected function get_hidden(string $name) {
        $elementname = $this->prefix . $name . '[' . $this->repeatindex . ']';
        $attributes = [];
        $attributes['name'] = $elementname;

        $element = new \MoodleQuickForm_hidden($elementname, $this->repeatindex, $attributes);

        return $element->toHtml();
    }

    /**
     * Get an mform static element as html fragment.
     *
     * @param string $name The element name without the prefix.
     * @param string $html
     * @return string The html fragment
     */
    protected function get_static(string $name, string $html) {
        $elementname = $this->prefix . $name . '_' . $this->repeatindex;
        $attributes = [];
        $attributes['id'] = 'id_' . $this->prefix . $name . '_' . $this->repeatindex;
        $attributes['name'] = $elementname;

        $element = new \MoodleQuickForm_static($elementname, '', $html);
        $element->setAttributes($attributes);

        return $this->output->mform_element($element, false, false, '', false);

    }
}