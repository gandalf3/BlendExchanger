// ==UserScript==
// @name        BlendExchange for blender.stackexchange
// @namespace   blender.org
// @description Upload to BlendExchange directly from StackExchange
// @include     *blender.stackexchange.com/*
// @version     1
// @grant       none
// ==/UserScript==

// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js

//CONFIG URL - I put it here where it is easy to change
var urlEmbed = "http://blend-exchange.giantcowfilms.com/embedUpload/?qurl=" + document.URL;

//stuff in main is run with jquery:
function main() {
    var pref_extra_markdown = 0
    console.log("running main!");

    function startInjection() {
        
        //add blend button when any of these elements are clicked:
        $(document).on('click', 'a.edit-post', waitForButtonRow); //inline editing
        $(document).on('click', 'input#answer-from-ask', waitForButtonRow); //answering own question in ask questions page
        $(document).on('click', 'input[value="Add Another Answer"]', waitForButtonRow); //adding multiple answers
        //review editing:
        $(document).on('click', 'input[value="Improve"]', waitForButtonRow); //improving suggested edits
        $(document).on('click', 'input[value="Edit"]', waitForButtonRow); //editing close voted questions

        //define keyboard shortcut even handler (Ctrl+Y)
        $(document).on('keydown', "textarea.wmd-input", function(e) {
            if (e.ctrlKey && (e.which === 89)) {
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
                    $(".wmd-button-row").each(function() {console.log("does it have a blend button? ", $(this).has(".wmd-blend-button").length);console.log("id", 
$(this).attr("id"))});
                    $(".wmd-button-row").each(function() {
                        if ($(this).has(".wmd-blend-button").length == 0) { //if no blend button exists, inject one
                            console.log("does not contain blend button, inserting one");
                            injectButton($(this));
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
        li.attr('title', 'Upload .blend to BlendExchange');
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
        
        //un-optimized version:
        
        /*data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QAoACgAKCGy\
        tphAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3wIZCjcLci%2BzRQAAA6pJREFUOMullG9M1HUcx1%2B%2F\
        7x3HcdxpnoLHTS4Cjou8DHogrpW1DBXTOZfJppuryXKzWA%2FcWpZrbf150HoQuWo0R3NaLpZFQ1ksIx3irpTtIHYBE\
        n8EOcTx9477%2F%2Ft9ewBcnqI%2B6P3ou%2Ff3831%2FP%2B99%2FijcBo%2FHI%2F1%2BP2azGYCsrCzuhZKSEmUpXn\
        %2B7WFlZGQ0NDVjMFvLy8pBIABQFpAQFkIDf7wcQ9xRcFANwOp04HI5kwPiJ1wgNtZNTdYp0ezEPgvD5fJ8DdHZ20t3djc1m\
        SwmY67lATvGT3Ko%2FTKi37cGCsVis2u12U1BQQG5uLgaDISVAS8SRkQAOVxETPx1BjrRzcTBOwbueyxxqffFOQcXr9crCwk\
        Ii%2FR5unqpGkzJ5mQhOoDevxJBhJudRN0p6JnVt0zTbX2fb7g2cPOP7%2B%2Br10Ftqzfqmu4py44uXcW2tRJMCRQhQdKiJ\
        ODqDcb4Uio4fBy00WXexded6urpmeGXP2uLMxr6aK%2B90KYGP3edSMpz6vpqA73ciwWmy3M9hfTgf%2FbLVCOdmhG0d9W0DH\
        L8wyNO7NuIfCCKEgsmUhsuVydnzI6Pe0egbw0cKf06WfkXlMXL21oAmsToeQSggnFto6jdTXHWaT8%2F2sKriWa6MhjAY558Zj\
        YLZWY3tL6yxb8gz16a%2FP7A5aXnO9xtj3xygaNt%2BdBkW5OQASnYxtTWNBGIaJlXyz5kWVlktxEpdCARGo8DbPkwE%2FaTQ6Y\
        nGpXte8EYHY3Wv4qrYS3B6CmVmhgwRZKGvsWcAM5NkW01oWJgORzFracniVa38y15RUREHELreZvo%2F24Fryx56fjnN8KVGEvEY\
        hKeIDv3JwR1PALDaakqeVU0jGAqx2BCLYgB6teUTXOW76WmuJ%2BelD5m95mF2fJDM9HFk3TM8v%2F9XttfuQ00kmBjp5SsthqpJo\
        qHwfJ9K1NTRc5ZzraWR%2FMPnUHIeh9xSRmt2MramANtD%2BcgT5YSAsJbGMl0cfa6XYDiBiMUX5ltqqYKb3ib%2F4PEkYbSvx\
        XGgluGTb9KfsRy7fSOZBhWL1IirgkC2jbnJWZarCVRVQ1GU8JLbJoUs2kTR0YtMnP%2BSodZvUQJjSASKaQWlxku0ynUIIYiE\
        o1rPzcgPS45ecna1%2FxwIcfeGuhXR%2BPryCNcj6d%2F1%2BeOuP%2FomD3Hsqav3zfB%2ByDIKKh0xSkoe27dA6VK2Df8PO\
        pLdumBZSnm0o6Pjg6UsL9q%2Bk3O73e8ZDIaPlvrhXyo9gDK7YfodAAAAAElFTkSuQmCC*/
        
        
        
        //define RMB preferences menu
        
        /*
        $(li).on("contextmenu", function(e) {
            e.preventDefault();
            console.log("started creating context menu. pref_extra_markdown =", pref_extra_markdown)
            //check if a preference menu already exists
            console.log("contextmenu.length: " + $("#blend-context-menu").length)
            
            if ($("#blend-context-menu").length < 1) { //ensure context menu doesn't already exist
                
            //console.log("contextmenu")
            var div = $("<div>").appendTo($(li).parent());
            div.attr("id", "blend-context-menu")
            var pOffset = $(li).parent().offset();
            div.css({"position": "absolute", "left": (e.pageX-pOffset.left)+5 + "px", "top": (e.pageY-pOffset.top) + "px",
                     "background-color": "rgba(0,0,0,.7)",
                     "color": "#f8f8f8",
                     "padding": "5px",
                     "padding-top": "1px",
                     "border-radius": "5px",
                     "box-shadow": "5px 5px 10px rgba(0,0,0,.7)"});

            var ul = $("<ul>").appendTo(div);
            
            ul.css({"list-style": "none",
                    "margin": "3px",
                    "cursor": "default"});
                
            //styling for headings, links
            ul.append("<li id='blend_info_links'>");
            $("#blend_info_links").html("<a href='http://meta.blender.stackexchange.com/a/391/599' title='Go to meta post for discussion and feedback'>About</a>").css({"font-size": 
"6pt"});
            ul.append("<li id='blend_context_title'>");
            $("#blend_context_title").html("Preferences:<br><hr>").css({"font-weight": "bold"});
            $("#blend_context_title hr").css({"margin": "0", "background-color": "rgba(200,200,200,.2)"});
                
                //TODO stylize checkbox
            
            ul.append("<li id='entry1'>");
            $("#entry1").html("Extra markdown <input type='checkbox' />");
            $("#entry1").attr("title", "Insert mouse and modifier key icons");
            $("#entry1 > input").css({"margin": "0"});
            //console.log("div height: " + div.css("height"));
            div.css({"top": (e.pageY-pOffset.top) - parseInt(div.css("height")) });
                
                //bind mouse sensors to the menu so it goes away on mouse off:
                var vanish_delay = setTimeout(function() {$("#blend-context-menu").fadeOut(500,function() {$(this).remove()})}, 1500);
                div.mouseleave(function() {
                    vanish_delay = setTimeout(function() {$("#blend-context-menu").fadeOut(500,function() {$(this).remove()})}, 500);
                })
                div.mouseenter(function() {
                    console.log("on context menu");
                    clearTimeout(vanish_delay);
                })
                
                //store preferences
                if (typeof get_prefs === "function") { //for normal chrome extensions get_prefs will be outside of scope
                    console.log("toggle_markdown:", get_prefs());
                    if (get_prefs() == 1) {
                        $("#entry1 > input").prop("checked", 1);
                    }
                }
                else { //if being run as chrome extension, use normal variable instead
                    console.log("get_prefs not found, probably running as chrome extension.", "WARNING: preferences won't be saved accross page loads")
                    if (pref_extra_markdown == 1) {
                        $("#entry1 > input").prop("checked", 1);
                    }
                }
                
                //bind mouse click sensor to the checkbox:
                if (typeof toggle_extra_markdown === "function") {
                   $("#entry1 > input").click(toggle_extra_markdown)
                }
                else {
                    $("#entry1 > input").click(function(){pref_extra_markdown ^= 1}) //toggle non persistent var with xor operator
                }
            }
            else {
                $("#blend-context-menu").remove() //right clicking on the icon when there is an existing context menu will remove it
            }
            console.log("finished creating context menu. pref_extra_markdown =", pref_extra_markdown)
        });
        */
    }
    
    function insertBlendFileDialog(txta, url) {
 
        //Not sure what all of this does 640px to allo for some breathing room
        var blendUploadWindow = window.open(url, '1424873319323', 'width=640,height=500,toolbar=no,menubar=no,location=no,status=0,scrollbars=0,resizable=0,left=500,top=500');
 
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
 
        /*
        // jQuery-way doesn't work :(
        var evt = $.Event('keydown');
        evt.which = 17;
        evt.keyCode = 17; // Ctrl
        $(txta).trigger(e);
 
        // another failing attempt
        $(txta).trigger({
            type: "keydown",
            which : 17
        });
        */
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
    
    
    startInjection() //call initial startup function (bind keyboard shortcuts, etc.)
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

