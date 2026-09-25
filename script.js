/* =========================================================
   SWAT PHOTOBOOTH SYSTEM
   EVENT + DESIGN STUDIO + PHOTOBOOTH
   COMPLETE / FIXED VERSION
========================================================= */


/* =========================================================
   GLOBAL DATA
========================================================= */

const STORAGE_EVENTS = "swat_photobooth_events";
const STORAGE_DESIGNS = "swat_photobooth_designs";

let events = [];
let designs = {};

let currentEventId = null;

let canvas = null;
let clipboardObject = null;

let undoStack = [];
let redoStack = [];

let isUndoRedo = false;
let isLoadingDesign = false;

let currentZoom = 1;


/* =========================================================
   PHOTOBOOTH DATA
========================================================= */

let cameraStream = null;

let capturedPhotoData = null;

let currentSlotIndex = 0;

let boothSlots = [];

let boothPhotos = {};

let finalPhotoData = null;

let countdownTimer = null;


/* =========================================================
   DEFAULT EVENTS
========================================================= */

const defaultEvents = [

    {
        id: "youth-sunday",
        name: "YOUTH SUNDAY",
        type: "YOUTH MINISTRY",
        description:
            "A special Sunday celebrating the youth and encouraging young people to live faithfully and be an example to others.",
        date: "",
        verse: "1 Timothy 4:12",
        custom: false
    },

    {
        id: "church-anniversary",
        name: "CHURCH ANNIVERSARY",
        type: "CHURCH",
        description:
            "A celebration of God's faithfulness through the years and His continued work through the church.",
        date: "",
        verse: "Psalm 77:11",
        custom: false
    },

    {
        id: "youth-fellowship",
        name: "YOUTH FELLOWSHIP",
        type: "FELLOWSHIP",
        description:
            "A time for young people to fellowship, encourage one another, and grow together in the Lord.",
        date: "",
        verse: "Hebrews 10:24",
        custom: false
    },

    {
        id: "youth-camp",
        name: "YOUTH CAMP",
        type: "SPECIAL EVENT",
        description:
            "A special time of fellowship, teaching, service, and spiritual growth for the youth.",
        date: "",
        verse: "Isaiah 40:31",
        custom: false
    }

];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadStoredData();

    initializeCanvas();

    setupImageInput();

    setupPropertyListeners();

    showHome();

});


/* =========================================================
   STORAGE
========================================================= */

function loadStoredData() {

    try {

        const storedEvents =
            localStorage.getItem(STORAGE_EVENTS);

        const storedDesigns =
            localStorage.getItem(STORAGE_DESIGNS);


        if (storedEvents) {

            events = JSON.parse(storedEvents);

        } else {

            events = structuredClone(defaultEvents);

            saveEvents();

        }


        if (storedDesigns) {

            designs = JSON.parse(storedDesigns);

        } else {

            designs = {};

            saveDesigns();

        }

    } catch (error) {

        console.error(
            "Could not load saved SWAT data:",
            error
        );

        events = structuredClone(defaultEvents);

        designs = {};

    }

}


function saveEvents() {

    localStorage.setItem(
        STORAGE_EVENTS,
        JSON.stringify(events)
    );

}


function saveDesigns() {

    localStorage.setItem(
        STORAGE_DESIGNS,
        JSON.stringify(designs)
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function hideAllMainScreens() {

    const screens = [

        "homePage",
        "eventPage",
        "designStudioPage",
        "photoboothPage"

    ];


    screens.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display = "none";

        }

    });


    const header =
        document.getElementById("siteHeader");

    const footer =
        document.getElementById("siteFooter");


    if (header) {

        header.style.display = "flex";

    }


    if (footer) {

        footer.style.display = "block";

    }

}


function showHome() {

    stopCamera();

    hideAllMainScreens();


    const home =
        document.getElementById("homePage");


    if (home) {

        home.style.display = "block";

    }


    updateMainNavigation("home");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showEvents() {

    stopCamera();

    hideAllMainScreens();


    const home =
        document.getElementById("homePage");


    if (home) {

        home.style.display = "block";

    }


    updateMainNavigation("events");


    setTimeout(() => {

        document
            .getElementById("events")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }, 50);

}


function showAbout() {

    stopCamera();

    hideAllMainScreens();


    const home =
        document.getElementById("homePage");


    if (home) {

        home.style.display = "block";

    }


    updateMainNavigation("about");


    setTimeout(() => {

        document
            .getElementById("about")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }, 50);

}


function updateMainNavigation(active) {

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.remove("active");

        });


    if (active === "home") {

        document
            .querySelector('.nav-link[href="#home"]')
            ?.classList.add("active");

    }


    if (active === "events") {

        document
            .querySelector('.nav-link[href="#events"]')
            ?.classList.add("active");

    }


    if (active === "about") {

        document
            .querySelector('.nav-link[href="#about"]')
            ?.classList.add("active");

    }

}


/* =========================================================
   EVENT SYSTEM
========================================================= */

function renderEvents() {

    /*
       The current index.html already contains the
       four designed event cards.

       We intentionally do not overwrite them here.
    */

    return;

}


function openEvent(eventId) {

    const event =
        events.find(
            item => item.id === eventId
        );


    if (!event) return;


    currentEventId = eventId;

    stopCamera();

    hideAllMainScreens();


    const eventPage =
        document.getElementById("eventPage");


    if (eventPage) {

        eventPage.style.display = "block";

    }


    const category =
        document.getElementById(
            "selectedEventCategory"
        );


    const title =
        document.getElementById(
            "selectedEventTitle"
        );


    const description =
        document.getElementById(
            "selectedEventDescription"
        );


    const verse =
        document.getElementById(
            "selectedEventVerse"
        );


    const reference =
        document.getElementById(
            "selectedEventReference"
        );


    if (category) {

        category.textContent =
            event.type || "EVENT";

    }


    if (title) {

        const words =
            event.name.trim().split(/\s+/);


        if (words.length > 1) {

            const firstHalf =
                words
                    .slice(0, -1)
                    .join(" ");

            const lastWord =
                words[words.length - 1];


            title.innerHTML =
                `${escapeHtml(firstHalf)}<br><span>${escapeHtml(lastWord)}</span>`;

        } else {

            title.textContent =
                event.name;

        }

    }


    if (description) {

        description.textContent =
            event.description || "";

    }


    if (verse) {

        verse.textContent =
            getVerseText(event.verse);

    }


    if (reference) {

        reference.textContent =
            `${event.verse || ""} · KJV`;

    }


    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


function getVerseText(reference) {

    const verses = {

        "1 Timothy 4:12":
            "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",

        "Psalm 77:11":
            "I will remember the works of the LORD: surely I will remember thy wonders of old.",

        "Hebrews 10:24":
            "And let us consider one another to provoke unto love and to good works.",

        "Isaiah 40:31":
            "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles."

    };


    return verses[reference] || "";
}


/* =========================================================
   CUSTOM EVENTS
========================================================= */

function openCreateEvent() {

    const modal =
        document.getElementById("eventModal");

    if (!modal) return;

    modal.style.display = "flex";


    document
        .getElementById("newEventName")
        ?.focus();

}


function closeCreateEvent() {

    const modal =
        document.getElementById("eventModal");

    if (modal) {

        modal.style.display = "none";

    }

}


function createCustomEvent() {

    const name =
        document
            .getElementById("newEventName")
            ?.value
            ?.trim();


    if (!name) {

        alert("Please enter an event name.");

        return;

    }


    const description =
        document
            .getElementById("newEventDescription")
            ?.value
            ?.trim() || "A custom SWAT event.";


    const date =
        document
            .getElementById("newEventDate")
            ?.value || "";


    const verse =
        document
            .getElementById("newEventVerse")
            ?.value
            ?.trim() || "—";


    const id =
        "custom-" +
        Date.now();


    events.push({

        id,

        name,

        type: "CUSTOM EVENT",

        description,

        date,

        verse,

        custom: true

    });


    saveEvents();

    closeCreateEvent();

    clearCreateEventForm();

    openEvent(id);

}


function clearCreateEventForm() {

    [
        "newEventName",
        "newEventDescription",
        "newEventDate",
        "newEventVerse"

    ].forEach(id => {

        const input =
            document.getElementById(id);

        if (input) {

            input.value = "";

        }

    });

}


function deleteCurrentEvent() {

    if (!currentEventId) return;


    const event =
        events.find(
            item => item.id === currentEventId
        );


    if (!event || !event.custom) return;


    const confirmed =
        confirm(
            `Delete "${event.name}"?\n\nThis will also delete its saved design.`
        );


    if (!confirmed) return;


    events =
        events.filter(
            item => item.id !== currentEventId
        );


    delete designs[currentEventId];


    saveEvents();

    saveDesigns();


    currentEventId = null;


    showEvents();

}


/* =========================================================
   DESIGN STUDIO
========================================================= */

function openDesignStudio() {

    if (!currentEventId) {

        alert(
            "Please select an event first."
        );

        return;

    }


    const event =
        events.find(
            item => item.id === currentEventId
        );


    if (!event) return;


    stopCamera();

    hideAllMainScreens();


    const header =
        document.getElementById("siteHeader");

    const footer =
        document.getElementById("siteFooter");

    const studio =
        document.getElementById("designStudioPage");


    if (header) {

        header.style.display = "none";

    }


    if (footer) {

        footer.style.display = "none";

    }


    if (studio) {

        studio.style.display = "block";

    }


    const studioName =
        document.getElementById(
            "studioEventName"
        );


    if (studioName) {

        studioName.textContent =
            event.name;

    }


    showDesignMode();

    loadDesignForEvent(currentEventId);

}


/* =========================================================
   DESIGN STUDIO NAVIGATION
========================================================= */

function exitDesignStudio() {

    saveDesign(false);

    stopCamera();

    currentEventId = null;

    showHome();

}


function backToHomeFromStudio() {

    exitDesignStudio();

}


function backToEventFromStudio() {

    saveDesign(false);

    stopCamera();

    openEvent(currentEventId);

}


function returnToDesignStudio() {

    stopCamera();

    hideFinalPhoto();


    const studio =
        document.getElementById(
            "designStudioPage"
        );


    const booth =
        document.getElementById(
            "photoboothPage"
        );


    const header =
        document.getElementById(
            "siteHeader"
        );


    const footer =
        document.getElementById(
            "siteFooter"
        );


    if (booth) {

        booth.style.display = "none";

    }


    if (header) {

        header.style.display = "none";

    }


    if (footer) {

        footer.style.display = "none";

    }


    if (studio) {

        studio.style.display = "block";

    }


    showDesignMode();

}


/* =========================================================
   DESIGN / BOOTH MODE
========================================================= */

function showDesignMode() {

    stopCamera();

    hideFinalPhoto();


    const designWorkspace =
        document.getElementById(
            "designWorkspace"
        );


    const designButton =
        document.getElementById(
            "designModeButton"
        );


    const boothButton =
        document.getElementById(
            "boothModeButton"
        );


    const studio =
        document.getElementById(
            "designStudioPage"
        );


    const booth =
        document.getElementById(
            "photoboothPage"
        );


    if (studio) {

        studio.style.display = "block";

    }


    if (booth) {

        booth.style.display = "none";

    }


    if (designWorkspace) {

        designWorkspace.style.display =
            "grid";

    }


    designButton?.classList.add("active");

    boothButton?.classList.remove("active");


    if (canvas) {

        canvas.discardActiveObject();

        canvas.requestRenderAll();

    }

}


function showBoothMode() {

    startPhotobooth();

}


/* =========================================================
   FABRIC CANVAS
========================================================= */

function initializeCanvas() {

    if (
        typeof fabric === "undefined" ||
        !document.getElementById(
            "designCanvas"
        )
    ) {

        console.error(
            "Fabric.js or designCanvas is missing."
        );

        return;

    }


    canvas =
        new fabric.Canvas(
            "designCanvas",
            {

                width: 1080,

                height: 1080,

                backgroundColor:
                    "#ffffff",

                preserveObjectStacking:
                    true,

                selection:
                    true

            }
        );


    setupCanvasEvents();

    canvas.renderAll();

    updateCanvasInfo();

    setTimeout(
        fitCanvas,
        100
    );

}


/* =========================================================
   CANVAS EVENTS
========================================================= */

function setupCanvasEvents() {

    if (!canvas) return;


    canvas.on(
        "selection:created",
        updateProperties
    );


    canvas.on(
        "selection:updated",
        updateProperties
    );


    canvas.on(
        "selection:cleared",
        clearProperties
    );


    canvas.on(
        "object:moving",
        updateProperties
    );


    canvas.on(
        "object:scaling",
        updateProperties
    );


    canvas.on(
        "object:rotating",
        updateProperties
    );


    canvas.on(
        "object:modified",
        () => {

            updateProperties();

            saveHistory();

        }
    );

}


/* =========================================================
   HISTORY
========================================================= */

function getCanvasJSON() {

    if (!canvas) return null;


    return canvas.toJSON([

        "customType",

        "photoIndex",

        "slotName",

        "slotRadius",

        "slotFill",

        "slotStroke",

        "slotStrokeWidth",

        "isPhoto",

        "photoSlotId",

        "locked"

    ]);

}


function saveHistory() {

    if (
        !canvas ||
        isUndoRedo ||
        isLoadingDesign
    ) return;


    const json =
        JSON.stringify(
            getCanvasJSON()
        );


    if (
        undoStack.length > 0 &&
        undoStack[
            undoStack.length - 1
        ] === json
    ) {

        return;

    }


    undoStack.push(json);


    if (undoStack.length > 50) {

        undoStack.shift();

    }


    redoStack = [];

}


function undo() {

    if (
        !canvas ||
        undoStack.length <= 1
    ) return;


    isUndoRedo = true;


    const current =
        undoStack.pop();


    redoStack.push(current);


    const previous =
        undoStack[
            undoStack.length - 1
        ];


    canvas
        .loadFromJSON(
            JSON.parse(previous)
        )
        .then(() => {

            canvas.renderAll();

            updateProperties();

            isUndoRedo = false;

        });

}


function redo() {

    if (
        !canvas ||
        redoStack.length === 0
    ) return;


    isUndoRedo = true;


    const next =
        redoStack.pop();


    undoStack.push(next);


    canvas
        .loadFromJSON(
            JSON.parse(next)
        )
        .then(() => {

            canvas.renderAll();

            updateProperties();

            isUndoRedo = false;

        });

}


/* =========================================================
   ADD TEXT
========================================================= */

function addText() {

    if (!canvas) return;


    const text =
        new fabric.IText(
            "YOUR TEXT",
            {

                left:
                    canvas.getWidth() / 2 - 100,

                top:
                    canvas.getHeight() / 2 - 30,

                fontFamily:
                    "Arial",

                fontSize:
                    60,

                fill:
                    "#111111",

                fontWeight:
                    "normal",

                fontStyle:
                    "normal",

                underline:
                    false,

                textAlign:
                    "left",

                charSpacing:
                    0,

                lineHeight:
                    1.16,

                stroke:
                    "#000000",

                strokeWidth:
                    0,

                shadow:
                    null,

                originX:
                    "left",

                originY:
                    "top",

                customType:
                    "text"

            }
        );


    canvas.add(text);

    canvas.setActiveObject(text);

    canvas.renderAll();

    saveHistory();

    updateProperties();

}


/* =========================================================
   ADD PHOTO SLOT
========================================================= */

function addPhotoSlot() {

    if (!canvas) return;


    const existingSlots =
        canvas
            .getObjects()
            .filter(
                object =>
                    object.customType ===
                    "photoSlot"
            );


    const photoIndex =
        existingSlots.length;


    const width = 400;

    const height = 400;


    const slot =
        new fabric.Rect(
            {

                left:
                    (canvas.getWidth() - width) / 2,

                top:
                    (canvas.getHeight() - height) / 2,

                width,

                height,

                fill:
                    "#e7eeee",

                stroke:
                    "#5e9f99",

                strokeWidth:
                    4,

                rx:
                    0,

                ry:
                    0,

                originX:
                    "left",

                originY:
                    "top",

                customType:
                    "photoSlot",

                photoIndex,

                slotName:
                    `PHOTO ${photoIndex + 1}`,

                slotRadius:
                    0,

                slotFill:
                    "#e7eeee",

                slotStroke:
                    "#5e9f99",

                slotStrokeWidth:
                    4,

                isPhoto:
                    false

            }
        );


    canvas.add(slot);

    canvas.setActiveObject(slot);

    canvas.renderAll();

    saveHistory();

    updateProperties();

}


/* =========================================================
   ADD SHAPE
========================================================= */

function addShape() {

    if (!canvas) return;


    const shape =
        new fabric.Rect(
            {

                left:
                    canvas.getWidth() / 2 - 100,

                top:
                    canvas.getHeight() / 2 - 100,

                width:
                    200,

                height:
                    200,

                fill:
                    "#5e9f99",

                rx:
                    20,

                ry:
                    20,

                originX:
                    "left",

                originY:
                    "top",

                customType:
                    "shape"

            }
        );


    canvas.add(shape);

    canvas.setActiveObject(shape);

    canvas.renderAll();

    saveHistory();

    updateProperties();

}


/* =========================================================
   IMAGE INPUT
========================================================= */

function addImage() {

    document
        .getElementById("imageInput")
        ?.click();

}


function setupImageInput() {

    const input =
        document.getElementById(
            "imageInput"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload = async e => {

                try {

                    const image =
                        await fabric.Image.fromURL(
                            e.target.result
                        );


                    const maxSize =
                        500;


                    const scale =
                        Math.min(

                            maxSize /
                                image.width,

                            maxSize /
                                image.height,

                            1

                        );


                    image.set({

                        left:
                            canvas.getWidth() / 2,

                        top:
                            canvas.getHeight() / 2,

                        originX:
                            "center",

                        originY:
                            "center",

                        scaleX:
                            scale,

                        scaleY:
                            scale,

                        customType:
                            "image",

                        opacity:
                            1

                    });


                    canvas.add(image);

                    canvas.setActiveObject(image);

                    canvas.renderAll();

                    saveHistory();

                    updateProperties();


                } catch (error) {

                    console.error(
                        "Image loading error:",
                        error
                    );

                    alert(
                        "Unable to load that image."
                    );

                }

            };


            reader.readAsDataURL(file);

            input.value = "";

        }
    );

}


/* =========================================================
   PROPERTY PANEL
========================================================= */

function updateProperties() {

    if (!canvas) return;


    const object =
        canvas.getActiveObject();


    const noSelection =
        document.getElementById(
            "noSelection"
        );


    const properties =
        document.getElementById(
            "objectProperties"
        );


    if (!object) {

        if (noSelection) {

            noSelection.style.display =
                "flex";

        }


        if (properties) {

            properties.style.display =
                "none";

        }


        return;

    }


    if (noSelection) {

        noSelection.style.display =
            "none";

    }


    if (properties) {

        properties.style.display =
            "block";

    }


    setValue(
        "propX",
        Math.round(
            object.left || 0
        )
    );


    setValue(
        "propY",
        Math.round(
            object.top || 0
        )
    );


    setValue(
        "propWidth",
        Math.round(
            object.getScaledWidth() || 0
        )
    );


    setValue(
        "propHeight",
        Math.round(
            object.getScaledHeight() || 0
        )
    );


    setValue(
        "propRotation",
        Math.round(
            object.angle || 0
        )
    );


    const type =
        object.customType;


    togglePanel(
        "textProperties",
        type === "text"
    );


    togglePanel(
        "imageProperties",
        type === "image" ||
        object.type === "image"
    );


    togglePanel(
        "photoSlotProperties",
        type === "photoSlot"
    );


    if (type === "text") {

        setValue(
            "propFont",
            object.fontFamily ||
                "Arial"
        );


        setValue(
            "propFontSize",
            object.fontSize ||
                60
        );


        setValue(
            "propTextColor",
            normalizeColor(
                object.fill,
                "#111111"
            )
        );


        setValue(
            "propTextAlign",
            object.textAlign ||
                "left"
        );


        setValue(
            "propCharSpacing",
            object.charSpacing ||
                0
        );


        setValue(
            "propLineHeight",
            object.lineHeight ||
                1.16
        );


        setValue(
            "propStrokeColor",
            normalizeColor(
                object.stroke,
                "#000000"
            )
        );


        setValue(
            "propStrokeWidth",
            object.strokeWidth ||
                0
        );


        document
            .getElementById(
                "boldButton"
            )
            ?.classList.toggle(
                "active",
                object.fontWeight ===
                    "bold"
            );


        document
            .getElementById(
                "italicButton"
            )
            ?.classList.toggle(
                "active",
                object.fontStyle ===
                    "italic"
            );


        document
            .getElementById(
                "underlineButton"
            )
            ?.classList.toggle(
                "active",
                object.underline === true
            );


        document
            .getElementById(
                "shadowButton"
            )
            ?.classList.toggle(
                "active",
                !!object.shadow
            );

    }


    if (
        type === "image" ||
        object.type === "image"
    ) {

        setValue(
            "propOpacity",
            Math.round(
                (object.opacity ?? 1) *
                100
            )
        );

    }


    if (type === "photoSlot") {

        setValue(
            "propSlotName",
            object.slotName ||
                "PHOTO"
        );


        setValue(
            "propSlotFill",
            normalizeColor(
                object.slotFill,
                "#e7eeee"
            )
        );


        setValue(
            "propSlotStroke",
            normalizeColor(
                object.slotStroke,
                "#5e9f99"
            )
        );


        setValue(
            "propSlotStrokeWidth",
            object.slotStrokeWidth ||
                0
        );


        setValue(
            "propSlotRadius",
            object.slotRadius ||
                0
        );

    }


    updateCanvasInfo();

}


function clearProperties() {

    const noSelection =
        document.getElementById(
            "noSelection"
        );


    const properties =
        document.getElementById(
            "objectProperties"
        );


    if (noSelection) {

        noSelection.style.display =
            "flex";

    }


    if (properties) {

        properties.style.display =
            "none";

    }


    [
        "textProperties",
        "imageProperties",
        "photoSlotProperties"

    ].forEach(id => {

        togglePanel(
            id,
            false
        );

    });

}


/* =========================================================
   PROPERTY LISTENERS
========================================================= */

function setupPropertyListeners() {

    bindInput(
        "propX",
        value => {

            const object =
                getSelectedObject();

            if (!object) return;

            object.set(
                "left",
                Number(value)
            );

            object.setCoords();

            renderCanvas();

        }
    );


    bindInput(
        "propY",
        value => {

            const object =
                getSelectedObject();

            if (!object) return;

            object.set(
                "top",
                Number(value)
            );

            object.setCoords();

            renderCanvas();

        }
    );


    bindInput(
        "propRotation",
        value => {

            const object =
                getSelectedObject();

            if (!object) return;

            object.set(
                "angle",
                Number(value)
            );

            object.setCoords();

            renderCanvas();

        }
    );


    bindInput(
        "propWidth",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                !object.width
            ) return;


            object.set(
                "scaleX",
                Number(value) /
                    object.width
            );


            object.setCoords();

            renderCanvas();

        }
    );


    bindInput(
        "propHeight",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                !object.height
            ) return;


            object.set(
                "scaleY",
                Number(value) /
                    object.height
            );


            object.setCoords();

            renderCanvas();

        }
    );


    bindChange(
        "propFont",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "fontFamily",
                value
            );


            renderCanvas();

            saveHistory();

        }
    );


    bindInput(
        "propFontSize",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "fontSize",
                Number(value)
            );


            renderCanvas();

        }
    );


    bindInput(
        "propTextColor",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "fill",
                value
            );


            renderCanvas();

        }
    );


    bindChange(
        "propTextAlign",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "textAlign",
                value
            );


            renderCanvas();

        }
    );


    bindInput(
        "propCharSpacing",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "charSpacing",
                Number(value)
            );


            renderCanvas();

        }
    );


    bindInput(
        "propLineHeight",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "lineHeight",
                Number(value)
            );


            renderCanvas();

        }
    );


    bindInput(
        "propStrokeColor",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "stroke",
                value
            );


            renderCanvas();

        }
    );


    bindInput(
        "propStrokeWidth",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "text"
            ) return;


            object.set(
                "strokeWidth",
                Number(value)
            );


            renderCanvas();

        }
    );


    bindInput(
        "propOpacity",
        value => {

            const object =
                getSelectedObject();

            if (!object) return;


            object.set(
                "opacity",
                Number(value) / 100
            );


            renderCanvas();

        }
    );


    bindInput(
        "propSlotName",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "photoSlot"
            ) return;


            object.set(
                "slotName",
                value
            );


            renderCanvas();

        }
    );


    bindInput(
        "propSlotFill",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "photoSlot"
            ) return;


            object.set({

                slotFill:
                    value,

                fill:
                    value

            });


            renderCanvas();

        }
    );


    bindInput(
        "propSlotStroke",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "photoSlot"
            ) return;


            object.set({

                slotStroke:
                    value,

                stroke:
                    value

            });


            renderCanvas();

        }
    );


    bindInput(
        "propSlotStrokeWidth",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "photoSlot"
            ) return;


            const width =
                Number(value);


            object.set({

                slotStrokeWidth:
                    width,

                strokeWidth:
                    width

            });


            renderCanvas();

        }
    );


    bindInput(
        "propSlotRadius",
        value => {

            const object =
                getSelectedObject();

            if (
                !object ||
                object.customType !==
                    "photoSlot"
            ) return;


            const radius =
                Number(value);


            object.set({

                slotRadius:
                    radius,

                rx:
                    radius,

                ry:
                    radius

            });


            renderCanvas();

        }
    );

}


/* =========================================================
   TEXT STYLES
========================================================= */

function toggleBold() {

    toggleTextStyle("bold");

}


function toggleItalic() {

    toggleTextStyle("italic");

}


function toggleUnderline() {

    toggleTextStyle("underline");

}


function toggleTextStyle(style) {

    const object =
        getSelectedObject();


    if (
        !object ||
        object.customType !==
            "text"
    ) return;


    if (style === "bold") {

        object.set(
            "fontWeight",
            object.fontWeight ===
                "bold"
                ? "normal"
                : "bold"
        );

    }


    if (style === "italic") {

        object.set(
            "fontStyle",
            object.fontStyle ===
                "italic"
                ? "normal"
                : "italic"
        );

    }


    if (style === "underline") {

        object.set(
            "underline",
            !object.underline
        );

    }


    renderCanvas();

    updateProperties();

    saveHistory();

}


function toggleShadow() {

    toggleTextShadow();

}


function toggleTextShadow() {

    const object =
        getSelectedObject();


    if (
        !object ||
        object.customType !==
            "text"
    ) return;


    if (object.shadow) {

        object.set(
            "shadow",
            null
        );

    } else {

        object.set(
            "shadow",
            new fabric.Shadow({

                color:
                    "rgba(0,0,0,0.45)",

                blur:
                    12,

                offsetX:
                    5,

                offsetY:
                    5

            })
        );

    }


    renderCanvas();

    updateProperties();

    saveHistory();

}


/* =========================================================
   IMAGE CONTROLS
========================================================= */

function flipHorizontal() {

    flipImageHorizontal();

}


function flipVertical() {

    flipImageVertical();

}


function resetImage() {

    resetImageTransform();

}


function flipImageHorizontal() {

    const object =
        getSelectedObject();


    if (!object) return;


    object.set(
        "flipX",
        !object.flipX
    );


    renderCanvas();

    saveHistory();

}


function flipImageVertical() {

    const object =
        getSelectedObject();


    if (!object) return;


    object.set(
        "flipY",
        !object.flipY
    );


    renderCanvas();

    saveHistory();

}


function resetImageTransform() {

    const object =
        getSelectedObject();


    if (!object) return;


    object.set({

        flipX:
            false,

        flipY:
            false,

        angle:
            0

    });


    renderCanvas();

    updateProperties();

    saveHistory();

}


/* =========================================================
   PHOTO SLOT RESET
========================================================= */

function resetPhotoSlot() {

    const object =
        getSelectedObject();


    if (
        !object ||
        object.customType !==
            "photoSlot"
    ) return;


    object.set({

        fill:
            "#e7eeee",

        stroke:
            "#5e9f99",

        strokeWidth:
            4,

        rx:
            0,

        ry:
            0,

        slotFill:
            "#e7eeee",

        slotStroke:
            "#5e9f99",

        slotStrokeWidth:
            4,

        slotRadius:
            0

    });


    renderCanvas();

    updateProperties();

    saveHistory();

}


/* =========================================================
   OBJECT ACTIONS
========================================================= */

function getSelectedObject() {

    if (!canvas) return null;

    return canvas.getActiveObject();

}


function deleteObject() {

    deleteSelected();

}


function deleteSelected() {

    const object =
        getSelectedObject();


    if (!object) return;


    canvas.remove(object);

    canvas.discardActiveObject();

    renderCanvas();

    clearProperties();

    saveHistory();

}


function duplicateObject() {

    duplicateSelected();

}


async function duplicateSelected() {

    const object =
        getSelectedObject();


    if (!object) return;


    try {

        const clone =
            await object.clone();


        clone.set({

            left:
                (object.left || 0) + 25,

            top:
                (object.top || 0) + 25

        });


        canvas.add(clone);

        canvas.setActiveObject(clone);

        renderCanvas();

        updateProperties();

        saveHistory();

    } catch (error) {

        console.error(
            "Could not duplicate object:",
            error
        );

    }

}


async function copySelected() {

    const object =
        getSelectedObject();


    if (!object) return;


    clipboardObject =
        await object.clone();

}


async function pasteObject() {

    if (!clipboardObject) return;


    const clone =
        await clipboardObject.clone();


    clone.set({

        left:
            (clone.left || 0) + 25,

        top:
            (clone.top || 0) + 25

    });


    canvas.add(clone);

    canvas.setActiveObject(clone);

    renderCanvas();

    updateProperties();

    saveHistory();

}


async function cutSelected() {

    await copySelected();

    deleteSelected();

}


/* =========================================================
   LOCK / VISIBILITY
========================================================= */

function toggleLock() {

    toggleSelectedLock();

}


function toggleSelectedLock() {

    const object =
        getSelectedObject();


    if (!object) return;


    const locked =
        object.locked !== true;


    object.locked =
        locked;


    object.set({

        lockMovementX:
            locked,

        lockMovementY:
            locked,

        lockScalingX:
            locked,

        lockScalingY:
            locked,

        lockRotation:
            locked,

        hasControls:
            !locked,

        selectable:
            true

    });


    renderCanvas();

    updateProperties();

    saveHistory();

}


function toggleVisibility() {

    toggleSelectedVisibility();

}


function toggleSelectedVisibility() {

    const object =
        getSelectedObject();


    if (!object) return;


    object.set(
        "visible",
        !object.visible
    );


    renderCanvas();

    canvas.discardActiveObject();

    clearProperties();

    saveHistory();

}


/* =========================================================
   LAYERS
========================================================= */

function bringForward() {

    const object =
        getSelectedObject();


    if (!object) return;


    canvas.bringObjectForward(object);

    renderCanvas();

    saveHistory();

}


function sendBackward() {

    const object =
        getSelectedObject();


    if (!object) return;


    canvas.sendObjectBackwards(object);

    renderCanvas();

    saveHistory();

}


function bringToFront() {

    const object =
        getSelectedObject();


    if (!object) return;


    canvas.bringObjectToFront(object);

    renderCanvas();

    saveHistory();

}


function sendToBack() {

    const object =
        getSelectedObject();


    if (!object) return;


    canvas.sendObjectToBack(object);

    renderCanvas();

    saveHistory();

}


/* =========================================================
   ALIGNMENT
========================================================= */

function alignLeft() {

    alignObject("left");

}


function alignCenterHorizontal() {

    alignObject("center");

}


function alignRight() {

    alignObject("right");

}


function alignTop() {

    alignObject("top");

}


function alignCenterVertical() {

    alignObject("middle");

}


function alignBottom() {

    alignObject("bottom");

}


function alignObject(position) {

    const object =
        getSelectedObject();


    if (!object) return;


    const width =
        object.getScaledWidth();


    const height =
        object.getScaledHeight();


    if (position === "left") {

        object.set({
            left: 0
        });

    }


    if (position === "center") {

        object.set({

            left:
                (canvas.getWidth() -
                    width) / 2

        });

    }


    if (position === "right") {

        object.set({

            left:
                canvas.getWidth() -
                width

        });

    }


    if (position === "top") {

        object.set({
            top: 0
        });

    }


    if (position === "middle") {

        object.set({

            top:
                (canvas.getHeight() -
                    height) / 2

        });

    }


    if (position === "bottom") {

        object.set({

            top:
                canvas.getHeight() -
                height

        });

    }


    object.setCoords();

    renderCanvas();

    updateProperties();

    saveHistory();

}


/* =========================================================
   CANVAS SETTINGS
========================================================= */

function openCanvasSettings() {

    const panel =
        document.getElementById(
            "canvasSettingsPanel"
        );


    if (panel) {

        panel.style.display =
            "block";

    }


    setValue(
        "canvasWidth",
        Math.round(
            canvas.getWidth()
        )
    );


    setValue(
        "canvasHeight",
        Math.round(
            canvas.getHeight()
        )
    );


    const background =
        document.getElementById(
            "canvasBackground"
        );


    if (background) {

        background.value =
            normalizeColor(
                canvas.backgroundColor,
                "#ffffff"
            );

    }

}


function closeCanvasSettings() {

    const panel =
        document.getElementById(
            "canvasSettingsPanel"
        );


    if (panel) {

        panel.style.display =
            "none";

    }

}


function setCanvasPreset(
    width,
    height
) {

    setValue(
        "canvasWidth",
        width
    );


    setValue(
        "canvasHeight",
        height
    );


    applyCustomCanvasSize();

}


function applyCustomCanvasSize() {

    if (!canvas) return;


    const width =
        Number(
            document.getElementById(
                "canvasWidth"
            )?.value
        );


    const height =
        Number(
            document.getElementById(
                "canvasHeight"
            )?.value
        );


    const background =
        document.getElementById(
            "canvasBackground"
        )?.value ||
        "#ffffff";


    if (
        !width ||
        !height ||
        width < 100 ||
        height < 100
    ) {

        alert(
            "Please enter a valid canvas size."
        );

        return;

    }


    canvas.setDimensions({

        width,

        height

    });


    canvas.backgroundColor =
        background;


    renderCanvas();

    updateCanvasInfo();

    closeCanvasSettings();

    fitCanvas();

    saveHistory();

}


/* =========================================================
   ZOOM
========================================================= */

function setZoomLevel(value) {

    if (!canvas) return;


    currentZoom =
        Math.max(
            0.25,
            Math.min(
                3,
                value
            )
        );


    canvas.setZoom(
        currentZoom
    );


    const zoomValue =
        document.getElementById(
            "zoomValue"
        );


    if (zoomValue) {

        zoomValue.textContent =
            `${Math.round(
                currentZoom * 100
            )}%`;

    }


    canvas.requestRenderAll();

}


function zoomIn() {

    setZoomLevel(
        currentZoom + 0.1
    );

}


function zoomOut() {

    setZoomLevel(
        currentZoom - 0.1
    );

}


function resetZoom() {

    setZoomLevel(1);

}


function fitCanvas() {

    if (!canvas) return;


    const area =
        document.querySelector(
            ".canvas-scroll-area"
        );


    if (!area) {

        resetZoom();

        return;

    }


    const availableWidth =
        Math.max(
            200,
            area.clientWidth - 80
        );


    const availableHeight =
        Math.max(
            200,
            area.clientHeight - 80
        );


    const zoomX =
        availableWidth /
        canvas.getWidth();


    const zoomY =
        availableHeight /
        canvas.getHeight();


    setZoomLevel(
        Math.min(
            zoomX,
            zoomY,
            1
        )
    );

}


/* =========================================================
   SAVE DESIGN
========================================================= */

function saveDesign(showMessage = true) {

    if (
        !canvas ||
        !currentEventId
    ) return;


    designs[currentEventId] = {

        canvas:
            getCanvasJSON(),

        width:
            canvas.getWidth(),

        height:
            canvas.getHeight(),

        background:
            canvas.backgroundColor,

        updatedAt:
            new Date().toISOString()

    };


    saveDesigns();


    if (showMessage) {

        showToast(
            "DESIGN SAVED"
        );

    }

}


/* =========================================================
   LOAD DESIGN
========================================================= */

function loadDesignForEvent(eventId) {

    if (!canvas) return;


    const saved =
        designs[eventId];


    isLoadingDesign = true;


    if (!saved) {

        canvas.clear();


        canvas.setDimensions({

            width:
                1080,

            height:
                1080

        });


        canvas.backgroundColor =
            "#ffffff";


        canvas.renderAll();


        isLoadingDesign = false;


        undoStack = [];

        redoStack = [];


        saveHistory();

        updateProperties();

        updateCanvasInfo();

        setTimeout(
            fitCanvas,
            50
        );


        return;

    }


    canvas
        .loadFromJSON(
            saved.canvas
        )
        .then(() => {

            canvas.setDimensions({

                width:
                    saved.width ||
                    1080,

                height:
                    saved.height ||
                    1080

            });


            canvas.backgroundColor =
                saved.background ||
                "#ffffff";


            /*
               Photo slots are always restored
               as design templates.

               Any old captured-photo objects
               from previous versions are removed.
            */

            const oldCaptured =
                canvas
                    .getObjects()
                    .filter(
                        object =>
                            object.customType ===
                                "capturedPhoto" ||
                            object.customType ===
                                "photoFrame"
                    );


            oldCaptured.forEach(
                object =>
                    canvas.remove(object)
            );


            canvas
                .getObjects()
                .filter(
                    object =>
                        object.customType ===
                        "photoSlot"
                )
                .forEach(slot => {

                    slot.isPhoto =
                        false;

                });


            canvas.renderAll();


            isLoadingDesign = false;


            undoStack = [];

            redoStack = [];


            saveHistory();

            updateProperties();

            updateCanvasInfo();


            setTimeout(
                fitCanvas,
                50
            );

        });

}


/* =========================================================
   NEW DESIGN
========================================================= */

function newDesign() {

    if (!canvas) return;


    const confirmed =
        confirm(
            "Start a new blank design?\n\nYour current design will be cleared from the canvas."
        );


    if (!confirmed) return;


    isLoadingDesign = true;


    canvas.clear();


    canvas.setDimensions({

        width:
            1080,

        height:
            1080

    });


    canvas.backgroundColor =
        "#ffffff";


    canvas.renderAll();


    isLoadingDesign = false;


    undoStack = [];

    redoStack = [];


    saveHistory();

    updateProperties();

    updateCanvasInfo();

    fitCanvas();

}


/* =========================================================
   DELETE DESIGN
========================================================= */

function deleteDesign() {

    if (!currentEventId) return;


    const event =
        events.find(
            item =>
                item.id ===
                currentEventId
        );


    if (!event) return;


    const confirmed =
        confirm(
            `Delete the saved design for "${event.name}"?\n\nThe event itself will NOT be deleted.`
        );


    if (!confirmed) return;


    delete designs[
        currentEventId
    ];


    saveDesigns();


    loadDesignForEvent(
        currentEventId
    );


    showToast(
        "DESIGN DELETED"
    );

}


/* =========================================================
   CANVAS INFO
========================================================= */

function updateCanvasInfo() {

    /*
       canvasInfo does not exist in the
       current HTML, so this is safely optional.
    */

    const info =
        document.getElementById(
            "canvasInfo"
        );


    if (!info || !canvas) return;


    info.textContent =
        `${Math.round(
            canvas.getWidth()
        )} × ${Math.round(
            canvas.getHeight()
        )}`;

}


/* =========================================================
   PHOTOBOOTH
========================================================= */

function startPhotobooth() {

    if (!currentEventId) {

        alert(
            "Please select an event first."
        );

        return;

    }


    if (!canvas) {

        alert(
            "Design Studio is not ready yet."
        );

        return;

    }


    saveDesign(false);

    stopCamera();

    hideFinalPhoto();


    const event =
        events.find(
            item =>
                item.id ===
                currentEventId
        );


    hideAllMainScreens();


    document.getElementById(
        "siteHeader"
    ).style.display = "none";


    document.getElementById(
        "siteFooter"
    ).style.display = "none";


    document.getElementById(
        "designStudioPage"
    ).style.display = "none";


    document.getElementById(
        "photoboothPage"
    ).style.display = "block";


    document.getElementById(
        "boothEventName"
    ).textContent =
        event?.name ||
        "EVENT";


    resetBoothVariables();


    findBoothSlots();

    updateBoothSlots();


    const designButton =
        document.getElementById(
            "designModeButton"
        );


    const boothButton =
        document.getElementById(
            "boothModeButton"
        );


    designButton?.classList.remove(
        "active"
    );


    boothButton?.classList.add(
        "active"
    );


    if (boothSlots.length === 0) {

        setBoothStatus(
            "NO PHOTO SLOTS — RETURN TO DESIGN"
        );

        return;

    }


    startCamera();

}


/* =========================================================
   FIND PHOTO SLOTS
========================================================= */

function findBoothSlots() {

    if (!canvas) {

        boothSlots = [];

        return;

    }


    boothSlots =
        canvas
            .getObjects()
            .filter(
                object =>
                    object.customType ===
                    "photoSlot"
            )
            .sort(
                (a, b) =>
                    (
                        Number(
                            a.photoIndex ?? 0
                        )
                    ) -
                    (
                        Number(
                            b.photoIndex ?? 0
                        )
                    )
            );

}


/* =========================================================
   BOOTH UI
========================================================= */

function updateBoothSlots() {

    const total =
        boothSlots.length;


    const filled =
        Object.keys(
            boothPhotos
        ).length;


    const slotProgress =
        document.getElementById(
            "slotProgress"
        );


    const stepNumber =
        document.getElementById(
            "boothStepNumber"
        );


    const captureButton =
        document.getElementById(
            "captureButton"
        );


    const finalButton =
        document.getElementById(
            "previewFinalButton"
        );


    if (total === 0) {

        if (slotProgress) {

            slotProgress.textContent =
                "NO PHOTO SLOTS";

        }


        if (stepNumber) {

            stepNumber.textContent =
                "—";

        }


        if (captureButton) {

            captureButton.disabled =
                true;

        }


        if (finalButton) {

            finalButton.disabled =
                true;

        }


        return;

    }


    const allFilled =
        filled >= total;


    const nextIndex =
        boothSlots.findIndex(
            slot =>
                !hasPhotoForSlot(slot)
        );


    if (slotProgress) {

        slotProgress.textContent =
            `${filled} / ${total}`;

    }


    if (stepNumber) {

        stepNumber.textContent =
            allFilled
                ? total
                : nextIndex + 1;

    }


    if (captureButton) {

        captureButton.disabled =
            allFilled ||
            !cameraStream;

    }


    if (finalButton) {

        finalButton.disabled =
            !allFilled;

    }

}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera() {

    const video =
        document.getElementById(
            "cameraPreview"
        );


    const startButton =
        document.getElementById(
            "startCameraButton"
        );


    if (!video) return;


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        setBoothStatus(
            "CAMERA NOT SUPPORTED"
        );

        alert(
            "Your browser does not support camera access."
        );

        return;

    }


    try {

        stopCamera();


        setBoothStatus(
            "STARTING CAMERA..."
        );


        if (startButton) {

            startButton.disabled =
                true;

        }


        cameraStream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "user",

                        width: {

                            ideal:
                                1920

                        },

                        height: {

                            ideal:
                                1080

                        }

                    },

                    audio:
                        false

                });


        video.srcObject =
            cameraStream;


        await video.play();


        setBoothStatus(
            "CAMERA READY"
        );


        if (startButton) {

            startButton.textContent =
                "CAMERA READY";

        }


        updateBoothSlots();


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        cameraStream = null;


        setBoothStatus(
            "CAMERA ACCESS DENIED"
        );


        if (startButton) {

            startButton.disabled =
                false;

            startButton.textContent =
                "START CAMERA";

        }


        alert(
            "Camera access could not be started.\n\nPlease allow camera permission in your browser and try again."
        );

    }

}


/* =========================================================
   CAPTURE
========================================================= */

function startCapture() {

    if (
        !cameraStream ||
        boothSlots.length === 0
    ) return;


    const nextIndex =
        boothSlots.findIndex(
            slot =>
                !hasPhotoForSlot(slot)
        );


    if (nextIndex === -1) {

        updateBoothSlots();

        return;

    }


    currentSlotIndex =
        nextIndex;


    const captureButton =
        document.getElementById(
            "captureButton"
        );


    if (captureButton) {

        captureButton.disabled =
            true;

    }


    setBoothStatus(
        `PHOTO ${currentSlotIndex + 1} — GET READY`
    );


    runCountdown();

}


/* =========================================================
   COUNTDOWN
========================================================= */

function runCountdown() {

    const countdown =
        document.getElementById(
            "countdown"
        );


    if (!countdown) return;


    clearInterval(
        countdownTimer
    );


    let number = 3;


    countdown.textContent =
        number;


    countdown.classList.add(
        "active"
    );


    countdownTimer =
        setInterval(
            () => {

                number--;


                if (number <= 0) {

                    clearInterval(
                        countdownTimer
                    );


                    countdownTimer =
                        null;


                    countdown.textContent =
                        "";


                    countdown.classList.remove(
                        "active"
                    );


                    capturePhoto();

                    return;

                }


                countdown.textContent =
                    number;

            },
            1000
        );

}


/* =========================================================
   CAPTURE PHOTO
========================================================= */

function capturePhoto() {

    const video =
        document.getElementById(
            "cameraPreview"
        );


    if (
        !video ||
        !video.videoWidth
    ) {

        setBoothStatus(
            "CAMERA NOT READY"
        );


        updateBoothSlots();

        return;

    }


    const tempCanvas =
        document.createElement(
            "canvas"
        );


    const width =
        video.videoWidth;


    const height =
        video.videoHeight;


    tempCanvas.width =
        width;


    tempCanvas.height =
        height;


    const context =
        tempCanvas.getContext(
            "2d"
        );


    /*
       Mirror the captured image so the
       final photo matches the preview.
    */

    context.save();

    context.translate(
        width,
        0
    );

    context.scale(
        -1,
        1
    );


    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    context.restore();


    capturedPhotoData =
        tempCanvas.toDataURL(
            "image/jpeg",
            0.95
        );


    showPhotoReview();

}


/* =========================================================
   PHOTO REVIEW
========================================================= */

function showPhotoReview() {

    const review =
        document.getElementById(
            "photoReview"
        );


    const image =
        document.getElementById(
            "capturedPhoto"
        );


    if (image) {

        image.src =
            capturedPhotoData;

    }


    if (review) {

        review.style.display =
            "block";

    }


    setBoothStatus(
        "REVIEW PHOTO"
    );

}


function hidePhotoReview() {

    const review =
        document.getElementById(
            "photoReview"
        );


    if (review) {

        review.style.display =
            "none";

    }

}


/* =========================================================
   RETAKE
========================================================= */

function retakePhoto() {

    capturedPhotoData =
        null;


    hidePhotoReview();


    setBoothStatus(
        `PHOTO ${currentSlotIndex + 1} — READY`
    );


    updateBoothSlots();

}


/* =========================================================
   USE PHOTO
========================================================= */

function usePhoto() {

    if (
        !capturedPhotoData ||
        !boothSlots[
            currentSlotIndex
        ]
    ) return;


    const slot =
        boothSlots[
            currentSlotIndex
        ];


    const slotKey =
        getSlotKey(slot);


    boothPhotos[
        slotKey
    ] =
        capturedPhotoData;


    capturedPhotoData =
        null;


    hidePhotoReview();


    setBoothStatus(
        "PHOTO SAVED"
    );


    updateBoothSlots();


    const nextIndex =
        boothSlots.findIndex(
            item =>
                !hasPhotoForSlot(item)
        );


    if (nextIndex !== -1) {

        currentSlotIndex =
            nextIndex;


        setBoothStatus(
            `PHOTO ${nextIndex + 1} — READY`
        );

    } else {

        setBoothStatus(
            "ALL PHOTOS CAPTURED"
        );

    }


    /*
       IMPORTANT:

       We do NOT modify the actual
       Fabric design canvas here.

       The design remains untouched.
    */

}


/* =========================================================
   SLOT IDENTIFICATION
========================================================= */

function getSlotKey(slot) {

    if (!slot) return "";


    if (
        slot.photoIndex !== undefined &&
        slot.photoIndex !== null
    ) {

        return String(
            slot.photoIndex
        );

    }


    return String(
        boothSlots.indexOf(slot)
    );

}


function hasPhotoForSlot(slot) {

    return Object.prototype.hasOwnProperty.call(
        boothPhotos,
        getSlotKey(slot)
    );

}


/* =========================================================
   FINAL PHOTO
========================================================= */

async function previewFinalPhoto() {

    if (
        boothSlots.length === 0
    ) {

        alert(
            "There are no photo slots in this design."
        );

        return;

    }


    const allFilled =
        boothSlots.every(
            slot =>
                hasPhotoForSlot(slot)
        );


    if (!allFilled) {

        alert(
            "Please capture all required photos first."
        );

        return;

    }


    try {

        setBoothStatus(
            "BUILDING FINAL PHOTO..."
        );


        finalPhotoData =
            await renderFinalComposition();


        const preview =
            document.getElementById(
                "finalPhotoPreview"
            );


        if (preview) {

            preview.src =
                finalPhotoData;

        }


        const modal =
            document.getElementById(
                "finalPhotoModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }


        setBoothStatus(
            "FINAL PHOTO READY"
        );


    } catch (error) {

        console.error(
            "Final photo error:",
            error
        );


        alert(
            "The final photo could not be created."
        );

    }

}


/* =========================================================
   FINAL COMPOSITION
========================================================= */

async function renderFinalComposition() {

    if (!canvas) {

        throw new Error(
            "Design canvas is not available."
        );

    }


    const width =
        canvas.getWidth();


    const height =
        canvas.getHeight();


    /*
       Use an independent StaticCanvas.

       The real Design Studio canvas is NEVER
       changed during final rendering.
    */

    const outputElement =
        document.createElement(
            "canvas"
        );


    const outputCanvas =
        new fabric.StaticCanvas(
            outputElement,
            {

                width,

                height,

                backgroundColor:
                    canvas.backgroundColor ||
                    "#ffffff"

            }
        );


    const objects =
        canvas.getObjects();


    /*
       Rebuild the design in exactly the same
       object order.

       Normal objects are cloned.

       Photo slots are replaced temporarily
       with the captured photo + transparent
       border.

       The original design remains untouched.
    */

    for (
        let index = 0;
        index < objects.length;
        index++
    ) {

        const original =
            objects[index];


        if (
            original.customType !==
            "photoSlot"
        ) {

            const clone =
                await original.clone();


            clone.set({

                selectable:
                    false,

                evented:
                    false

            });


            outputCanvas.add(
                clone
            );


            continue;

        }


        const slot =
            original;


        const photo =
            boothPhotos[
                getSlotKey(slot)
            ];


        if (!photo) {

            const placeholder =
                await slot.clone();


            placeholder.set({

                selectable:
                    false,

                evented:
                    false

            });


            outputCanvas.add(
                placeholder
            );


            continue;

        }


        const photoImage =
            await fabric.Image.fromURL(
                photo
            );


        addPhotoToOutputCanvas(
            outputCanvas,
            photoImage,
            slot
        );


        /*
           Add the slot's border back on top.

           The border uses the EXACT original
           position, size, scale, rotation,
           and corner radius.
        */

        const frame =
            await slot.clone();


        frame.set({

            fill:
                "rgba(0,0,0,0)",

            selectable:
                false,

            evented:
                false,

            customType:
                "finalPhotoFrame"

        });


        outputCanvas.add(
            frame
        );

    }


    outputCanvas.renderAll();


    const data =
        outputCanvas.toDataURL({

            format:
                "png",

            multiplier:
                1

        });


    outputCanvas.dispose();


    return data;

}


/* =========================================================
   ADD PHOTO TO FINAL CANVAS
========================================================= */

function addPhotoToOutputCanvas(
    outputCanvas,
    image,
    slot
) {

    const slotWidth =
        Math.abs(
            slot.getScaledWidth()
        );


    const slotHeight =
        Math.abs(
            slot.getScaledHeight()
        );


    const center =
        slot.getCenterPoint();


    const sourceWidth =
        image.width;


    const sourceHeight =
        image.height;


    const sourceRatio =
        sourceWidth /
        sourceHeight;


    const targetRatio =
        slotWidth /
        slotHeight;


    /*
       Crop the source image to COVER the
       complete photo slot.

       This prevents stretching.
    */

    let cropX = 0;

    let cropY = 0;

    let cropWidth =
        sourceWidth;

    let cropHeight =
        sourceHeight;


    if (
        sourceRatio >
        targetRatio
    ) {

        cropWidth =
            sourceHeight *
            targetRatio;

        cropX =
            (sourceWidth -
                cropWidth) / 2;

    } else {

        cropHeight =
            sourceWidth /
            targetRatio;

        cropY =
            (sourceHeight -
                cropHeight) / 2;

    }


    image.set({

        cropX,

        cropY,

        width:
            cropWidth,

        height:
            cropHeight,

        left:
            center.x,

        top:
            center.y,

        originX:
            "center",

        originY:
            "center",

        scaleX:
            slotWidth /
            cropWidth,

        scaleY:
            slotHeight /
            cropHeight,

        angle:
            slot.angle || 0,

        selectable:
            false,

        evented:
            false

    });


    /*
       Rounded photo slots are clipped
       using an absolute canvas-positioned
       clip path.

       This is only created on the final
       rendering canvas.
    */

    const radius =
        Number(
            slot.slotRadius || 0
        );


    if (radius > 0) {

        const scaleX =
            Math.abs(
                slot.scaleX || 1
            );


        const scaleY =
            Math.abs(
                slot.scaleY || 1
            );


        const clip =
            new fabric.Rect({

                left:
                    center.x,

                top:
                    center.y,

                width:
                    Math.abs(
                        slot.width *
                        scaleX
                    ),

                height:
                    Math.abs(
                        slot.height *
                        scaleY
                    ),

                rx:
                    radius *
                    scaleX,

                ry:
                    radius *
                    scaleY,

                originX:
                    "center",

                originY:
                    "center",

                angle:
                    slot.angle || 0,

                absolutePositioned:
                    true

            });


        image.clipPath =
            clip;

    }


    outputCanvas.add(
        image
    );

}


/* =========================================================
   FINAL PHOTO MODAL
========================================================= */

function closeFinalPhoto() {

    hideFinalPhoto();

}


function hideFinalPhoto() {

    const modal =
        document.getElementById(
            "finalPhotoModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   SAVE FINAL PHOTO
========================================================= */

function saveFinalPhoto() {

    if (!finalPhotoData) return;


    const event =
        events.find(
            item =>
                item.id ===
                currentEventId
        );


    const fileName =
        sanitizeFileName(
            event?.name ||
            "SWAT-PHOTO"
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        finalPhotoData;


    link.download =
        `${fileName}-photo.png`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    showToast(
        "PHOTO SAVED"
    );

}


/* =========================================================
   PRINT FINAL PHOTO
========================================================= */

function printFinalPhoto() {

    if (!finalPhotoData) return;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=900"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                SWAT Photo
            </title>

            <style>

                html,
                body {

                    margin: 0;

                    padding: 0;

                    background: #ffffff;

                    width: 100%;

                    height: 100%;

                }

                body {

                    display: flex;

                    align-items: center;

                    justify-content: center;

                }

                img {

                    max-width: 100%;

                    max-height: 100%;

                    object-fit: contain;

                }

                @media print {

                    @page {

                        margin: 0;

                    }

                    body {

                        width: 100%;

                        height: 100%;

                    }

                    img {

                        width: 100%;

                        height: 100%;

                        object-fit: contain;

                    }

                }

            </style>

        </head>

        <body>

            <img
                src="${finalPhotoData}"
                alt="SWAT Photo"
                onload="window.print();"
            >

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* =========================================================
   RESET PHOTOBOOTH SESSION
========================================================= */

function resetBoothVariables() {

    capturedPhotoData =
        null;


    currentSlotIndex =
        0;


    boothSlots =
        [];


    boothPhotos =
        {};


    finalPhotoData =
        null;


    clearInterval(
        countdownTimer
    );


    countdownTimer =
        null;


    hidePhotoReview();

    hideFinalPhoto();


    const countdown =
        document.getElementById(
            "countdown"
        );


    if (countdown) {

        countdown.textContent =
            "";

    }


    const captureButton =
        document.getElementById(
            "captureButton"
        );


    if (captureButton) {

        captureButton.disabled =
            true;

    }


    const finalButton =
        document.getElementById(
            "previewFinalButton"
        );


    if (finalButton) {

        finalButton.disabled =
            true;

    }


    const startButton =
        document.getElementById(
            "startCameraButton"
        );


    if (startButton) {

        startButton.disabled =
            false;

        startButton.textContent =
            "START CAMERA";

    }

}


function resetBoothSession() {

    const confirmed =
        confirm(
            "Reset this photobooth session?\n\nAll captured photos will be removed and you will start again."
        );


    if (!confirmed) return;


    stopCamera();


    resetBoothVariables();


    findBoothSlots();


    updateBoothSlots();


    if (boothSlots.length > 0) {

        startCamera();

    }

}


/* =========================================================
   EXIT PHOTOBOOTH
========================================================= */

function exitPhotobooth() {

    returnToDesignStudio();

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    clearInterval(
        countdownTimer
    );


    countdownTimer =
        null;


    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

    }


    cameraStream =
        null;


    const video =
        document.getElementById(
            "cameraPreview"
        );


    if (video) {

        video.srcObject =
            null;

    }


    updateBoothSlots();

}


/* =========================================================
   BOOTH STATUS
========================================================= */

function setBoothStatus(message) {

    const status =
        document.getElementById(
            "boothStatus"
        );


    if (status) {

        status.textContent =
            message;

    }

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    async event => {

        const target =
            event.target;


        const typing =
            target &&
            (

                target.tagName ===
                    "INPUT" ||

                target.tagName ===
                    "TEXTAREA" ||

                target.tagName ===
                    "SELECT" ||

                target.isContentEditable

            );


        if (
            typing &&
            !(
                event.ctrlKey ||
                event.metaKey
            )
        ) {

            return;

        }


        if (!canvas) return;


        const key =
            event.key.toLowerCase();


        if (
            key === "delete" ||
            key === "backspace"
        ) {

            if (!typing) {

                event.preventDefault();

                deleteSelected();

            }

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "z" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            undo();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "z" &&
            event.shiftKey
        ) {

            event.preventDefault();

            redo();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "y"
        ) {

            event.preventDefault();

            redo();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "c"
        ) {

            if (!typing) {

                event.preventDefault();

                await copySelected();

            }

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "v"
        ) {

            if (!typing) {

                event.preventDefault();

                await pasteObject();

            }

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "x"
        ) {

            if (!typing) {

                event.preventDefault();

                await cutSelected();

            }

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "s"
        ) {

            event.preventDefault();

            saveDesign();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "+"
        ) {

            event.preventDefault();

            zoomIn();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "-"
        ) {

            event.preventDefault();

            zoomOut();

        }


        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            key === "0"
        ) {

            event.preventDefault();

            fitCanvas();

        }

    }
);


/* =========================================================
   GENERIC HELPERS
========================================================= */

function renderCanvas() {

    if (!canvas) return;


    canvas.renderAll();

    updateProperties();

}


function togglePanel(
    id,
    visible
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.style.display =
        visible
            ? "block"
            : "none";

}


function bindInput(
    id,
    callback
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.addEventListener(
        "input",
        event => {

            callback(
                event.target.value
            );

        }
    );

}


function bindChange(
    id,
    callback
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.addEventListener(
        "change",
        event => {

            callback(
                event.target.value
            );

        }
    );

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.value =
        value ?? "";

}


function normalizeColor(
    color,
    fallback
) {

    if (
        typeof color ===
            "string" &&
        color.startsWith("#")
    ) {

        return color;

    }


    return fallback;

}


function formatDate(date) {

    if (!date) return "—";


    const parsed =
        new Date(
            date +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-PH",
        {

            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"

        }
    );

}


function sanitizeFileName(name) {

    return String(name)

        .replace(
            /[^a-z0-9]/gi,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        )

        .replace(
            /^-|-$/g,
            ""
        )

        .toLowerCase();

}


function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "swatToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "swatToast";


        toast.style.position =
            "fixed";


        toast.style.bottom =
            "25px";


        toast.style.left =
            "50%";


        toast.style.transform =
            "translateX(-50%)";


        toast.style.padding =
            "12px 18px";


        toast.style.border =
            "1px solid rgba(94,159,153,.4)";


        toast.style.borderRadius =
            "8px";


        toast.style.background =
            "#111919";


        toast.style.color =
            "#8bc4be";


        toast.style.fontSize =
            "9px";


        toast.style.fontWeight =
            "800";


        toast.style.letterSpacing =
            "1.5px";


        toast.style.zIndex =
            "3000";


        toast.style.transition =
            "opacity .25s ease";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

            },
            1800
        );

}