// ==UserScript==
// @name        BlendExchanger
// @namespace   blender.org
// @description Upload .blends to Blend-Exchange directly from StackExchange
// @include     *blender.stackexchange.com/*
// @version     1
// @grant       none
// ==/UserScript==

//CONFIG URL - I put it here where it is easy to change
var urlEmbed = "http://blend-exchange.giantcowfilms.com/embedUpload/?qurl=" + document.URL;

//stuff in main is run with jquery:
function main() {
    var pref_extra_markdown = 0
    console.log("running main!");

    function startInjection() {
        
        //add blend button when any of these elements are clicked:
        $(document).on('click', 'a.edit-post', waitForButtonRow); //inline editing
        $(document).on('click', 'input[value="Add Another Answer"]', waitForButtonRow); //adding multiple answers
        //review editing:
        $(document).on('click', 'input[value="Improve"]', waitForButtonRow); //improving suggested edits
        $(document).on('click', 'input[value="Edit"]', waitForButtonRow); //editing close voted questions

        //define keyboard shortcut even handler (Ctrl+Y)
        $(document).on('keydown', "textarea.wmd-input", function (e) {
            if (e.altKey && (e.which === 66)) {
                insertBlendFileDialog(this, urlEmbed);
            }
        });
        
        waitForButtonRow();
    }
    
    function waitForButtonRow() {
        console.log("waiting for button row..")
        
        function testForButtonRow() { /*test for a .wmd-button-row every half a second until one is found*/
            if (counter < 60) {
                if ($(".wmd-button-row").length > 0) { //if button row(s) exist, test each one to see if it already has a blend button
                    console.log("found .wmd-button-row");
                    $(".wmd-button-row").each(function() {console.log("does it have a blend button? ", $(this).has(".wmd-blend-button").length);console.log("id", $(this).attr("id"))});
                    $(".wmd-button-row").each(function() {
                        if ($(this).has(".wmd-blend-button").length == 0) { //if no blend button exists, inject one
                          
                            if (document.URL.indexOf("blender.stackexchange.com/questions/ask") < 1) { //but only add button if we are not asking a question
                              console.log("does not contain blend button, inserting one");
                              injectButton($(this));
                            }
                            else {
                              console.log("no buttons allowed on ask question page")
                            }
                        }
                    });
                }
                else {
                    setTimeout(testForButtonRow, 500);
                    counter++;
                }
            }
            else {
                console.log("did not find a place to put blend button within 30 seconds. giving up.");
                return;
            }
        }
        
        var counter = 0;
        setTimeout(testForButtonRow, 500); //bit of spacer time to allow SE js to execute and add button rows.
        //TODO: This causes a potential race condition (if SE js takes longer than 500ms), a better workaround would be nice..
    }

    function injectButton(buttonRow) {

        var blendButtonId = 'wmd-blend-button' + buttonRow.attr("id").replace(/[^0-9]+/g, "");

        var li = $("<li/>");
        li.attr('id', blendButtonId);
        li.attr('title', 'Upload .blend to Blend-Exchange Alt+B');
        li.addClass('wmd-button wmd-blend-button');
        li.click(function() {
            insertBlendFileDialog($(this).parents("div[class='wmd-container']").find("textarea").first()[0],urlEmbed);
        });

        //shuffle existing buttons around so blend button is the one after image button
        var imgButton = $(buttonRow).children("[id^=wmd-image]");
        li.insertAfter(imgButton);

        li.css("left", parseInt(imgButton.css("left")) + 25 + "px"); //put blend button 25 px after img button
        li.nextAll().each(function() {
           $(this).css("left", parseInt($(this).css("left")) + 25 + "px"); //move buttons after blend button farther over
        });

        //Add image element with base64 encoded png icon
        var img = $("<img/>").appendTo(li);
        img.attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V%2B0%2FAAABaFBMVEUAAAAAAA\
        BUpudZo%2BD9%2Ff0BbMcKfdp1wO9bpOBNoeNClts3jdQ3kdgje8hbqt00jdjW1tYAe94dh9wAbca3t7f09PTQ0ND\
        y8vLOzs7RaBPo6Oj3s3LTdSdotO%2FIyMj1rWlKdqz3sGrRbBr0eAD%2F%2F%2F%2F8%2BvmB0PmAzPhbpOCxw9tIi\
        sb028XtzLEzZKLahDv2ljrPZxKZ5f%2BW4v%2F9%2Ff2N2f16xvZvvPJRr%2BQzmtpJltJElNDr2Mjv1L5Hhr67u7sx\
        dLWvr68fXqPtoV3clVvqnFfUeS7PZQ%2FOXQNXy%2Fvf7PJKufBmu%2B3s7OxisOs%2FrOhWsuZWpuH3699Epd%2Bnwt\
        xMnNjX19d5stbU1NTn3dP75dD75c%2BPrslKjMZDgrzz17s0eLnozLdwnKzqu5b5wInTqomllIH4un7kp3X0qWLjnWHyp\
        mD3qF2RclvQjVj2olHjk1DqlUr2mUDskj7ZfjT0jCj0iSLWcyDqdgVv3a2kAAAAFXRSTlMCAOv7fExK%2FfHl3dbMyKWdk\
        nRRNgeqtpszAAABIklEQVQY023R1XLCQBSA4YQCdW%2BybJcQQ%2BO4u9Xd3d319bskpcx0%2BC%2F24rs4M2cPQZKkp1Qo\
        0FakGYHNW%2FJMW7kIK2zebQBA1Z0FoI1jHnpzAaNQ007%2BkKYoCuCMl5t6bn%2FY8Ys5Nw663%2B%2FYh4PIoMNCyLM8Yh\
        FCl%2FkYExlwmnj7ZTyj873o%2BqGfYRLh%2FglzptJAaDdULs7MJZh4LGxzYlQge3Xv48rFY2me8QdttnGCliFfqTz5OFXlp\
        OVFf3AKz7yAPGzUXuWQyoWk5EogSOAgC8%2Bq2od4FPXt5JMbgZ4WPgoylYXapyh%2Bi%2Bm1NMb2RopQf9N1fSmVifd11ly9F\
        ppN4zSV6R3tIKBazW6NDE3%2BR4rGH9wFCTM7PoILZz52y34AnZsz2CzgIFUAAAAASUVORK5CYII%3D');
        
    }
    
    function insertBlendFileDialog(txta, url) {
        
        //for easy adjustment of popup size
        var popupWidth = 640;
        var popupHeight = 400;
        
        var left = (($(window).width()/2)+window.screenX)-(popupWidth/2);
        var top = (($(window).height()/2)+window.screenY)-(popupHeight/2);
        
        console.log("left", left);
        console.log("top", top);
        
        var blendUploadWindow = window.open(url, "Blend-Exchange wormhole portal vortex uploader thingy", "width=" + popupWidth + ",height=" + popupHeight + ",toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no,left=" + left + ",top=" + top);
 
        window.addEventListener("message", function (event) {
            //It is necessary to check the origin form stopping foreign pages hijacking the event
            if (event.data.name == "embedSource" && event.origin == "http://blend-exchange.giantcowfilms.com") {
                console.log("Event Fired");
                //Get the embed code
                embedCode = event.data.content;
                //Log the vent to debug
                console.log(event.data.content);
                insertBlendFile(txta, embedCode);
                //Check if window is closed, if not close it
                if (false == blendUploadWindow.closed) {
                    blendUploadWindow.close();
                }
            } else {
                console.log(event);
                console.log("Invalid Event Fired");
            }
        });
    };
    
    function insertBlendFile(txta,embedCode) {
 
        if (txta.selectionStart == null) return;
 
        var start = txta.selectionStart;
        var end = txta.selectionEnd;
        var added = 0;
        var chars = txta.value;
        console.log("chars: " + chars);
 
        //separate selection from rest of body
        var pre = chars.slice(0, start);
        var post = chars.slice(end);
 
        //TODO Remove unessary stuff
        if (start != end) {
            var sel = chars.slice(start, end);
            console.log("sel: " + sel);
            sel = sel.match(/(?:\S+|\s)/g); //split string around whitespace without deleting whitespace, thanks to this SO post: http://stackoverflow.com/a/24504047/2730823
            console.log("sel: " + sel);
            //remove extra spaces and replace them with kbd markdown
            //var lastElement = ""; //holds previous element
            var wasSpace = 0; //tracks if last element was a space
            var endSpaces = 0; //needed for special end cases
            var endSpace = 0;
            var refined_markdown = "";
 
            //handle end case separatly; if there is more than 1 space at the end, the last array item is '</kbd><kbd>'
            //that will result in an extra <kbd> pair, so remove it.
            if (endSpaces > 0) {
                sel.splice(endSpace, 1);
            }
 
        }
        else { /*if there is no selection, assign sel to an array so that sel.join returns ""*/
            var sel = ["", ];
        }
        //put everything back together again
        txta.value = pre + embedCode + post;
        //BROKEN:
        added = sel.join("").length + 11
        //TODO, this is broken. Need to update cursor position calculation
        txta.selectionStart = txta.selectionEnd = pre.length + ((start == end) ? 5 : added); //remove the selection and move
 
        $(txta).focus();
 
        updateMarkdownPreview(txta);
 
    }

    //function to force update the live markdown render
    function updateMarkdownPreview(element) {

        var keyboardEvent = document.createEvent("KeyboardEvent");
        var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

        /*keyboardEvent[initMethod](
                       "keydown", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        17, // keyCodeArg : unsigned long the virtual key code, else 0
                        0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
        );
        element.dispatchEvent(keyboardEvent);*/
        
        //horrible hack so undo after inserting blend tags only removes blend tags
        //TODO not sure why this works, need to investigate at some point..
        keyboardEvent[initMethod](
                       "keydown", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        66, // keyCodeArg : unsigned long the virtual key code, else 0
                        0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
        );
        element.dispatchEvent(keyboardEvent);
        keyboardEvent[initMethod](
                       "keydown", // event type : keydown, keyup, keypress
                        true, // bubbles
                        true, // cancelable
                        window, // viewArg: should be window
                        false, // ctrlKeyArg
                        false, // altKeyArg
                        false, // shiftKeyArg
                        false, // metaKeyArg
                        8, // keyCodeArg : unsigned long the virtual key code, else 0
                        0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
        );
        element.dispatchEvent(keyboardEvent);

    }
    
    
    startInjection() //call initial startup function
}
main();

//get jquery on chrome, thanks to this SO post: http://stackoverflow.com/a/12751531/2730823
if (typeof jQuery === "function") {
    console.log ("Running with local copy of jQuery!");
    main (jQuery);
}
else {
    console.log ("fetching jQuery from some 3rd-party server.");
    add_jQuery (main, "1.7.1");
}

function add_jQuery (callbackFn, jqVersion) {
    var jqVersion   = jqVersion || "1.7.1";
    var D           = document;
    var targ        = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
    var scriptNode  = D.createElement ('script');
    scriptNode.src  = 'http://ajax.googleapis.com/ajax/libs/jquery/'
                    + jqVersion
                    + '/jquery.min.js'
                    ;
    scriptNode.addEventListener ("load", function () {
        var scriptNode          = D.createElement ("script");
        scriptNode.textContent  =
            'var gm_jQuery  = jQuery.noConflict (true);\n'
            + '(' + callbackFn.toString () + ')(gm_jQuery);'
        ;
        targ.appendChild (scriptNode);
    }, false);
    targ.appendChild (scriptNode);
}
