/**
 * Unilabel type imageboard
 *
 * @author      Andreas Schenkel
 * @copyright   Andreas Schenkel {@link https://github.com/andreasschenkel}
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import * as Str from 'core/str';
import log from 'core/log';

export const init = (canvaswidth, canvasheight, gridcolor, xsteps, ysteps) => {
    canvaswidth = parseInt(canvaswidth, 10);
    canvasheight = parseInt(canvasheight, 10);
    xsteps = parseInt(xsteps, 10);
    ysteps = parseInt(ysteps, 10);
    registerAllEventlistener();
    // Timeout notwendig, damit das Bild in der Draftarea "vorhanden" ist.
    // document.querySelector('#id_unilabeltype_imageboard_backgroundimage_fieldset .filemanager-container .realpreview');
    setTimeout(refreshBackgroundImage, 1000);
    // To show all images on pageload.
    setTimeout(refreshAllImages, 1000);
    setTimeout(function() {
        renderHelpergrid(canvaswidth, canvasheight, gridcolor, xsteps, ysteps);
    }, 1000);

    // In preview only ONE helpergrid exists with number 0...
    const gridtoggler = document.getElementById("unilabeltype-imageboard-gridtoggler-0");
    const togglerText = gridtoggler.querySelector('.unilabeltype-imageboard-toggle-text');
    gridtoggler.addEventListener("click", function(event) {
        const helpergrid = document.getElementById("unilabeltype-imageboard-helpergrid-0");
        event.stopPropagation();
        event.preventDefault();
        if (helpergrid.classList.contains("hidden")) {
            showGrid(togglerText, helpergrid);
        } else {
            hideGrid(togglerText, helpergrid);
        }
    });

    /**
     * Helper function to show the grid from imageboard.
     *
     * @param {object} button
     * @param {object} helpergrid
     */
    function showGrid(button, helpergrid) {
        helpergrid.classList.remove("hidden");
        button.value = 'gridvisible';
        Str.get_string('buttonlabelhelpergridhide', 'unilabeltype_imageboard').done(function(text) {
            button.innerText = text;
        });
    }

    /**
     * Helper function to remove the grid from imageboard.
     *
     * @param {object} button
     * @param {object} helpergrid
     */
    function hideGrid(button, helpergrid) {
        helpergrid.classList.add("hidden");
        button.value = 'gridhidden';
        Str.get_string('buttonlabelhelpergridshow', 'unilabeltype_imageboard').done(function(text) {
            button.innerText = text;
        });
    }

    /**
     * This function handles all focus out events if the event is from on of our input fields.
     *
     * @param {event} event
     */
    function focusoutExecute(event) {
        let imagenumber = -1;
        // 1. Check where the focus out event was created form input or imagesetting input.
        const eventid = event.target.getAttribute('id');
        let eventsourceimagesetting = eventid.split("id-unilabeltype-imageboard-imagesettings-")[1];
        let eventsourceform = eventid.split("id_unilabeltype_imageboard_")[1];

        // ToDo:  Check if it is a focus out event has to be more precise ... Delete-Icon!!!!
        if (typeof eventsourceimagesetting !== "undefined" || typeof eventsourceform !== "undefined") {
            // 2. If ID starts with id_unilabeltype_imageboard_ then focus out came from form input fields.
            if (typeof eventsourceimagesetting !== "undefined" && eventsourceimagesetting !== '') {
                // Call updateForm and use as parameter the input field that should be updated in the form.
                imagenumber = updateForm(eventsourceimagesetting);
            }

            // 3. ID starts with id_unilabeltype_imageboard_. Focus from the form The imagesettings must be updated.
            if (typeof eventsourceform !== "undefined" && eventsourceform !== '') {
                // A imagenumber = updateImagesetting(eventsourceform);
                // We have to update all filed in imagesettingsdialog
                // Sus dem event nun doch die nummer auslesen
                let eventsourceformnumber = eventsourceform.substr(eventsourceform.length - 1, eventsourceform.length);
                writeFormdataOfImageToImagesettingsdialogupdate(eventsourceformnumber);
            }

            // Now we know which image was changed and we can refresh on or all images.
            if (imagenumber >= 0) {
                refreshImage(imagenumber);
            } else {
                refreshAllImages();
            }
        }
    }

    /**
     * Upates the input field in the mform
     *
     * @param {string} eventsourceimagesetting
     * @returns {number}
     */
    function updateForm(eventsourceimagesetting) {
        const imagenumber = parseInt(document.getElementById('id-unilabeltype-imageboard-imagesettings-number').innerHTML) - 1;
        let value = document.getElementById('id-unilabeltype-imageboard-imagesettings-' + eventsourceimagesetting).value;
        // Check if the value is an integer.
        if (eventsourceimagesetting === 'xposition' ||
            eventsourceimagesetting === 'yposition' ||
            eventsourceimagesetting === 'border' ||
            eventsourceimagesetting === 'borderradius') {
            let num = Number(value);
            if (value !== '' && !Number.isInteger(num)) {
                return -1;
            }
        }

        let field = document.getElementById('id_unilabeltype_imageboard_' + eventsourceimagesetting + '_' + imagenumber);
        if (field !== null) {
            field.value = value;
        }
        return imagenumber;
    }

    /**
     *
     * @param {number} technicalnumber
     */
    function writeFormdataOfImageToImagesettingsdialogupdate(technicalnumber) {
        let selectedImage = getAllImagedataFromForm(technicalnumber);
        // Den Imagesettings-Anzeigebereich aktualisieren
        const imagesettingsNumber = document.getElementById('id-unilabeltype-imageboard-imagesettings-number');
        imagesettingsNumber.innerHTML = (parseInt(selectedImage.technicalnumber) + 1);

        const imagesettingsTitle = document.getElementById('id-unilabeltype-imageboard-imagesettings-title');
        imagesettingsTitle.value = selectedImage.title;

        const imagesettingsInputPositionX = document.getElementById('id-unilabeltype-imageboard-imagesettings-xposition');
        imagesettingsInputPositionX.value = parseInt(selectedImage.xposition);
        const imagesettingsInputPositionY = document.getElementById('id-unilabeltype-imageboard-imagesettings-yposition');
        imagesettingsInputPositionY.value = parseInt(selectedImage.yposition);
        const imagesettingsInputBorder = document.getElementById('id-unilabeltype-imageboard-imagesettings-border');
        imagesettingsInputBorder.value = parseInt(selectedImage.border);

        const imagesettingsInputBorderradius = document.getElementById('id-unilabeltype-imageboard-imagesettings-borderradius');
        imagesettingsInputBorderradius.value = parseInt(selectedImage.borderradius);
    }

    /**
     *
     * @param {event} event
     */
    function onclickExecute(event) {
        var targetid = event.target.getAttribute('id');
        var mform = targetid.split('button-mform1')[1];
        if (mform) {
            setTimeout(function() {
                // An element was added so we have to add a div for the image to the dom.
                let singleElements = document.querySelectorAll('[id^="fitem_id_unilabeltype_imageboard_title_"]');
                let number = singleElements.length;
                addImageToDom(number - 1);
            }, 500);
        } else {
            // Wenn kein Element hinzugefügt wird prüfen, ob man den Imagesettingsdialog ausblenden will.
            var imagesettindgdialogid = event.target.getAttribute('id');
            if (imagesettindgdialogid === 'id-unilabeltype-imageboard-imagesettings-close') {
               imagesettingsdivvisibility('hidden');
            }
        }
    }

    /**
     *
     * @param {event} event
     */
    function onRightclick(event) {
       event.preventDefault();
       // Get the number of the image that was selected with the right mouse button
        var idoftarget = event.target.getAttribute('id');
        if (!idoftarget) {
          return;
        }

        // Check, if idoftarget ist an id of an image
        let technicalnumber = idoftarget.split('unilabel-imageboard-imageid-')[1];
        // Oder ein Titel wurde angeklickt
        if (!technicalnumber) {
            technicalnumber = idoftarget.split('id_elementtitle-')[1];
        }
        if (technicalnumber) {
            // Update the imagesettingsdialog with the data of that image and show the dialog
            writeFormdataOfImageToImagesettingsdialogupdate(technicalnumber);
            // A imagesettingsdivvisibility('visible');
            // Wenn das selectierte Bild eine andere nummer hat als das aktuelle imagesettings anzeigt dann auf jeden fall anzeigen
            const imagenumber = parseInt(document.getElementById('id-unilabeltype-imageboard-imagesettings-number').innerHTML);
            if (technicalnumber == imagenumber) {
                imagesettingsdivvisibilitytoggler();
            } else {
                // Auf jeden fall anzeigen ... entweder war es schon scihtbar, dann nicht toggeln oder es war
                // unsichtbar, dann anzeichen
                imagesettingsdivvisibility('visible');
            }
        } else {
            // No image was selected ... do nothing.
        }
    }

    /**
     *
     * @param {string} visibility
     */
    function imagesettingsdivvisibility(visibility) {
        let imagesettingsdiv = document.getElementById("id-unilabeltype-imageboard-imagesettings");
        imagesettingsdiv.style.visibility = visibility;
    }

    /**
     *
     */
    function imagesettingsdivvisibilitytoggler() {
        let imagesettingsdiv = document.getElementById("id-unilabeltype-imageboard-imagesettings");
        if (imagesettingsdiv && imagesettingsdiv.style && imagesettingsdiv.style.visibility == 'visible') {
            imagesettingsdiv.style.visibility = 'hidden';
        } else {
            if (imagesettingsdiv && imagesettingsdiv.style && imagesettingsdiv.style.visibility == 'hidden') {
                imagesettingsdiv.style.visibility = 'visible';
            }
        }

    }

    /**
     * Register eventlistener to the all input fields of the form to register
     * focus-out events from input fields in order to trigger a fresh of the preview.
     */
    function registerAllEventlistener() {
        var mform = document.querySelectorAll('[id^="mform"]')[0];
        // We register one listener per eventtype to the mform and use the bubble-event-feature to check out
        // the target of an event.

        // All focusout-events will be handeled by oneListenerForAllInputFocusout.
        mform.addEventListener("focusout", focusoutExecute, false);

        // All click-events will be handeled by oneListenerForAllInputClick.
        mform.addEventListener("click", onclickExecute, false);

        // All click-events will be handeled by oneListenerForAllInputClick.
        mform.addEventListener("contextmenu", onRightclick, false);

        // All uploadCompleted-events
        // mform.addEventListener(eventTypes.uploadCompleted, machwas, false);

        // First: When uploading a backgroundimage the backgroundimage of the backgroundimagediv must be updated.
        // ToDo: better use eventlistener
        let backgroundfileNode = document.getElementById('id_unilabeltype_imageboard_backgroundimage_fieldset');
        if (backgroundfileNode) {
            let observer = new MutationObserver(refreshBackgroundImage);
            observer.observe(backgroundfileNode, {attributes: true, childList: true, subtree: true});
        }
        // Also add listener for canvas size
        let canvasx = document.getElementById('id_unilabeltype_imageboard_canvaswidth');
        if (canvasx) {
            let observer = new MutationObserver(refreshBackgroundImage);
            observer.observe(canvasx, {attributes: true, childList: true, subtree: true});
        }
        let canvasy = document.getElementById('id_unilabeltype_imageboard_canvasheight');
        if (canvasy) {
            let observer = new MutationObserver(refreshBackgroundImage);
            observer.observe(canvasy, {attributes: true, childList: true, subtree: true});
        }
    }

    /**
     * Sets the background image of the SVG to the current image in filemanager.
     */
    function refreshBackgroundImage() {
        let filemanagerbackgroundimagefieldset = document.getElementById('id_unilabeltype_imageboard_backgroundimage_fieldset');
        let previewimage = filemanagerbackgroundimagefieldset.getElementsByClassName('realpreview');
        let backgrounddiv = document.getElementById('unilabel-imageboard-background-canvas');

        if (previewimage.length > 0) {
            let backgroundurl = previewimage[0].getAttribute('src').split('?')[0];
            // If the uploaded file reuses the filename of a previously uploaded image, they differ
            // only in the oid. So one has to append the oid to the url.
            if (previewimage[0].getAttribute('src').split('?')[1].includes('&oid=')) {
                backgroundurl += '?oid=' + previewimage[0].getAttribute('src').split('&oid=')[1];
            }
            backgrounddiv.style.background = 'red'; // ToDo: Do wie need this code? Just to indicate changes during dev.
            backgrounddiv.style.backgroundSize = 'cover';
            backgrounddiv.style.backgroundImage = "url('" + backgroundurl + "')";

            const canvaswidthinput = document.getElementById('id_unilabeltype_imageboard_canvaswidth');
            let canvaswidthselected = canvaswidthinput.selectedOptions;
            let canvaswidth = canvaswidthselected[0].value;
            backgrounddiv.style.width = canvaswidth + "px";

            const canvasheightinput = document.getElementById('id_unilabeltype_imageboard_canvasheight');
            let canvasheightselected = canvasheightinput.selectedOptions;
            let canvasheight = canvasheightselected[0].value;
            backgrounddiv.style.height = canvasheight + "px";
        } else {
            // Image might be deleted so update the backroundidv and remove backgroundimage in preview;
            // ToDo    if (previewimage.length > 0) does not recognize when an image is deleted so we need a different condition!
            backgrounddiv.style.background = 'green'; // Todo: check if this is needed. just to indicate changes during development.
            backgrounddiv.style.backgroundImage = "url('')";
            const canvaswidthinput = document.getElementById('id_unilabeltype_imageboard_canvaswidth');
            let canvaswidthselected = canvaswidthinput.selectedOptions;
            let canvaswidth = canvaswidthselected[0].value;
            backgrounddiv.style.width = canvaswidth + "px";

            const canvasheightinput = document.getElementById('id_unilabeltype_imageboard_canvasheight');
            let canvasheightselected = canvasheightinput.selectedOptions;
            let canvasheight = canvasheightselected[0].value;
            backgrounddiv.style.height = canvasheight + "px";
        }
    }


    /**
     *
     * @param {number} canvaswidth
     * @param {number} canvasheight
     * @param {string} gridcolor
     * @param {number} xsteps
     * @param {number} ysteps
     */
    function renderHelpergrid(canvaswidth, canvasheight, gridcolor, xsteps, ysteps) {
        let helpergrids = [];
        for (let y = 0; y < canvasheight; y = y + ysteps) {
            for (let x = 0; x < canvaswidth; x = x + xsteps) {
                let helpergrid = {};
                helpergrid.x = x;
                helpergrid.y = y;
                helpergrids.push(helpergrid);
            }
        }
        // In preview only one helpergrid exists .... we use cmid = 0.
        const context = {
            // Data to be rendered
            helpergrids: helpergrids,
            gridcolor: gridcolor,
            xsteps: xsteps,
            ysteps: ysteps,
            cmid: 0,
            hidden: 0
        };

        Templates.renderForPromise('unilabeltype_imageboard/imageboard_helpergridpreview', context).then(({html, js}) => {
            // We have to get the actual content, combine it with the rendered image and replace then the actual content.
            let imageboardcontainer = document.getElementById('imageboardcontainer').innerHTML;
            let combined = "<div>" + imageboardcontainer + "</div>" + html;
            Templates.replaceNodeContents('#imageboardcontainer', combined, js);
            // ToDo: Check.
            return;
        }).catch(() => {
            log.debug('Rendering failed');
        });
    }


    /**
     * Gets the number of ALL elements in the form and then adds a div for each element to the dom if not already exists.
     * We need a timeout
     */
    function refreshAllImages() {
        const singleElements = document.querySelectorAll('[id^="fitem_id_unilabeltype_imageboard_image_"]');
        for (let i = 0; i < singleElements.length; i++) {
            // Todo: Skip removed elements that are still in the dom but hidden.
            let singleElement = singleElements[i].getAttribute('id');
            let number = singleElement.split('fitem_id_unilabeltype_imageboard_image_')[1];
            // Check if there exists already a div for this image.
            const imageid = document.getElementById('unilabel-imageboard-imageid-' + number);
            if (imageid === null) {
                // Div does not exist so we need do add it do dom.
                addImageToDom(number);
                // ToDo: Do we need a timeout to wait until the dic was added so that refresh can work correctly?
                // see also refreshImage ... there is already a timeout
                setTimeout(function() {
                    refreshImage(number);
                }, 1000);
            } else {
                refreshImage(number);
            }
        }
    }

    /**
     *
     * @param {int} number
     */
    function addImageToDom(number) {
        const imageid = document.getElementById('unilabel-imageboard-imageid-' + number);
        if (imageid === null) {
            renderAddedImage(number);
            // This div does not exist so we need do add it do dom.
            // Add an obverser to be able to update if image is uploaded.
            let imagefileNode = document.getElementById('fitem_id_unilabeltype_imageboard_image_' + (number));
            if (imagefileNode) {
                let observer = new MutationObserver(refreshImage);
                observer.observe(imagefileNode, {attributes: true, childList: true, subtree: true});
            }
        } else {
            // Div already exists so we need only to refresh the image because we only uploaded a new image
            // to an already existing div.
            refreshImage(number);
        }
    }

    /**
     *
     * @param {number} number of
     */
    function renderAddedImage(number) {
        const context = {
            // Data to be rendered
            number: number,
            title: "title"
        };

        Templates.renderForPromise('unilabeltype_imageboard/previewimage', context).then(({html, js}) => {
            // We have to get the actual content, combine it with the rendered image and replace then the actual content.
            let imageboardcontainer = document.getElementById('imageboardcontainer').innerHTML;
            let combined = "<div>" + imageboardcontainer + "</div>" + html;
            Templates.replaceNodeContents('#imageboardcontainer', combined, js);
            return;
        }).catch(() => {
            // No tiny editor present.
        });
    }

    /**
     * If an image was uploaded or inputfields in the form changed then we need to refresh
     * this image.
     * @param {int} number
     */
    function refreshImage(number) {
        // When there was an upload, then the number is NOT a number.
        // ToDo: Do not yet know the best way how I will get the number in his case.
        // For now if it is a number the normal refresh can be used and only ONE image will be refreshed.
        // In the else code ther will be a refresh of ALL images until I can refactor this.
        if (!Array.isArray(number)) {
            let imageid = document.getElementById("unilabel-imageboard-imageid-" + number);
            // Fill all the needed values for imagedata.
            let imagedata = getAllImagedataFromForm(number);
            imageid.style.background = imagedata.titlebackgroundcolor;
            imageid.src = imagedata.src;

            if (imagedata.src === "") {
                // Hide the image div.
                imageid.classList.add("hidden");
            } else {
                imageid.classList.remove("hidden");
                imageid.alt = imagedata.alt;
            }

            const imagediv = document.getElementById('unilabel-imageboard-element-' + number);
            imagediv.style.left = parseInt(imagedata.xposition) + "px";
            imagediv.style.top = parseInt(imagedata.yposition) + "px";

            // Switch to the correct class eg "unilable-imageboard-titlelineheight-4 if lineheight = 4.
            const idelementtitle = document.getElementById('id_elementtitle-' + number);
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-0");
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-1");
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-2");
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-3");
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-4");
            idelementtitle.classList.remove("unilable-imageboard-titlelineheight-5");
            const dummy = "unilable-imageboard-titlelineheight-" + imagedata.titlelineheight;
            idelementtitle.classList.add(dummy);

            if (imagedata.targetwidth != 0) {
                imageid.style.width = imagedata.targetwidth + "px";
            } else {
                imageid.style.width = "auto";
            }
            if (imagedata.targetheight != 0) {
                imageid.style.height = imagedata.targetheight + "px";
            } else {
                imageid.style.height = "auto";
            }
            if (imagedata.title != "") {
                imageid.title = (parseInt(number) + 1) + ": " + imagedata.title;
            } else {
                imageid.title = (parseInt(number) + 1) + ": ";
            }
            if (imagedata.border != 0) {
                imageid.style.border = imagedata.border + "px solid";
                imageid.style.borderColor = imagedata.titlebackgroundcolor;
            } else {
                imageid.style.border = "0";
            }
            if (imagedata.borderradius != 0) {
                imageid.style.borderRadius = imagedata.borderradius + "px";
            } else {
                imageid.style.borderRadius = "0";
            }

            // Title above image.
            const elementtitle = document.getElementById('id_elementtitle-' + number);
            elementtitle.innerHTML = imagedata.title;
            elementtitle.style.color = imagedata.titlecolor;
            elementtitle.style.backgroundColor = imagedata.titlebackgroundcolor;
            elementtitle.style.fontSize = imagedata.fontsize + "px";
            elementtitle.style.borderRadius = imagedata.borderradius + "px";
        } else {
            setTimeout(function() {
                refreshAllImages();
            }, 600);
        }
    }

    /**
     * Get all data from image that is stored in the form and collects them in one array.
     *
     * @param {int} technicalnumber of the image
     * @returns {*[]} Array with the collected information that are set in the form for the image.
     */
    function getAllImagedataFromForm(technicalnumber) {
        let imageids = {
            title: 'id_unilabeltype_imageboard_title_' + technicalnumber,
            titlecolor: 'id_unilabeltype_imageboard_titlecolor_colourpicker',
            titlebackgroundcolor: 'id_unilabeltype_imageboard_titlebackgroundcolor_colourpicker',
            titlelineheight: 'id_unilabeltype_imageboard_titlelineheight',
            fontsize: 'id_unilabeltype_imageboard_fontsize',
            alt: 'id_unilabeltype_imageboard_alt_' + technicalnumber,
            xposition: 'id_unilabeltype_imageboard_xposition_' + technicalnumber,
            yposition: 'id_unilabeltype_imageboard_yposition_' + technicalnumber,
            targetwidth: 'id_unilabeltype_imageboard_targetwidth_' + technicalnumber,
            targetheight: 'id_unilabeltype_imageboard_targetheight_' + technicalnumber,
            src: '',
            border: 'id_unilabeltype_imageboard_border_' + technicalnumber,
            borderradius: 'id_unilabeltype_imageboard_borderradius_' + technicalnumber,
            // A coordinates: "unilabel-imageboard-coordinates-" + technicalnumber,
        };

        let imagedata = {};
        imagedata.technicalnumber = technicalnumber;
        imagedata.title = document.getElementById(imageids.title).value;
        imagedata.titlecolor = document.getElementById(imageids.titlecolor).value;
        imagedata.titlebackgroundcolor = document.getElementById(imageids.titlebackgroundcolor).value;
        imagedata.titlelineheight = document.getElementById(imageids.titlelineheight).value;
        imagedata.fontsize = document.getElementById(imageids.fontsize).value;
        imagedata.alt = document.getElementById(imageids.alt).value;
        imagedata.xposition = document.getElementById(imageids.xposition).value;
        imagedata.yposition = document.getElementById(imageids.yposition).value;
        imagedata.targetwidth = document.getElementById(imageids.targetwidth).value;
        imagedata.targetheight = document.getElementById(imageids.targetheight).value;

        // Get the src of the draftfile.
        const element = document.getElementById('id_unilabeltype_imageboard_image_' + technicalnumber + '_fieldset');
        const imagetag = element.getElementsByTagName('img');
        let src = '';
        if (imagetag.length && imagetag.length != 0) {
            src = imagetag[0].src;
            src = src.split('?')[0];
        }
        imagedata.src = src;
        imagedata.border = document.getElementById(imageids.border).value;
        imagedata.borderradius = document.getElementById(imageids.borderradius).value;

        return imagedata;
    }
};
