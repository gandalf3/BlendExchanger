// ==UserScript==
// @name        BlendExchanger
// @include     *blender.stackexchange.com/*
// @description Upload .blends to Blend-Exchange without leaving StackExchange
// @version     2.0.0
// @license     GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @namespace   blender.org
// @updateURL   https://openuserjs.org/meta/gandalf3/BlendExchanger.meta.js
// @downloadURL https://openuserjs.org/src/scripts/gandalf3/BlendExchanger.user.js
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V%2B0%2FAAABaFBMVEUAAAAAAABUpudZo%2BD9%2Ff0BbMcKfdp1wO9bpOBNoeNClts3jdQ3kdgje8hbqt00jdjW1tYAe94dh9wAbca3t7f09PTQ0NDy8vLOzs7RaBPo6Oj3s3LTdSdotO%2FIyMj1rWlKdqz3sGrRbBr0eAD%2F%2F%2F%2F8%2BvmB0PmAzPhbpOCxw9tIisb028XtzLEzZKLahDv2ljrPZxKZ5f%2BW4v%2F9%2Ff2N2f16xvZvvPJRr%2BQzmtpJltJElNDr2Mjv1L5Hhr67u7sxdLWvr68fXqPtoV3clVvqnFfUeS7PZQ%2FOXQNXy%2Fvf7PJKufBmu%2B3s7OxisOs%2FrOhWsuZWpuH3699Epd%2BnwtxMnNjX19d5stbU1NTn3dP75dD75c%2BPrslKjMZDgrzz17s0eLnozLdwnKzqu5b5wInTqomllIH4un7kp3X0qWLjnWHypmD3qF2RclvQjVj2olHjk1DqlUr2mUDskj7ZfjT0jCj0iSLWcyDqdgVv3a2kAAAAFXRSTlMCAOv7fExK%2FfHl3dbMyKWdknRRNgeqtpszAAABIklEQVQY023R1XLCQBSA4YQCdW%2BybJcQQ%2BO4u9Xd3d319bskpcx0%2BC%2F24rs4M2cPQZKkp1Qo0FakGYHNW%2FJMW7kIK2zebQBA1Z0FoI1jHnpzAaNQ007%2BkKYoCuCMl5t6bn%2FY8Ys5Nw663%2B%2FYh4PIoMNCyLM8YhFCl%2FkYExlwmnj7ZTyj873o%2BqGfYRLh%2FglzptJAaDdULs7MJZh4LGxzYlQge3Xv48rFY2me8QdttnGCliFfqTz5OFXlpOVFf3AKz7yAPGzUXuWQyoWk5EogSOAgC8%2Bq2od4FPXt5JMbgZ4WPgoylYXapyh%2Bi%2Bm1NMb2RopQf9N1fSmVifd11ly9FppN4zSV6R3tIKBazW6NDE3%2BR4rGH9wFCTM7PoILZz52y34AnZsz2CzgIFUAAAAASUVORK5CYII%3D
// ==/UserScript==

// ==OpenUserJS==
// @author gandalf3
// ==/OpenUserJS==

// Additional credits: GiantCowFilms, CoDEmanX, and iKlsR



// Shortcut is Alt+B by default, you can change it here if you wish
function shortcutShouldFire(ev) {
   return (ev.altKey && (ev.key == 'b'));
}

// URL of blend-exchange embeded upload view
const EmbedURL = "https://blend-exchange.giantcowfilms.com/embedUpload/?qurl=" + document.URL;

//Quiet debugging prints
console.log = function() {};


function main() {
   console.log("running main!");

   function startInjection() {

     	// We can't know the url of the question if it hasn't been asked yet, so don't just abort
     	if (document.URL.indexOf("blender.stackexchange.com/questions/ask") >= 1) {
         console.log('Disabling BlendExchanger because you\'re currently asking a question.' +
                    'Come back and edit it once you\'ve posted it (so that we know the URL)');
         return;
      }

      //try and add .blend button when any of these elements are clicked:
      document.querySelectorAll('a.edit-post, ' +
                                'input[value="Add Another Answer"], ' + //adding multiple answers
                                'input[value="Improve"], ' + //improving suggested edits
                                'input[value="Edit"]' //editing close voted questions
                               ).forEach(elem => {
      	elem.addEventListener('click', waitForButtonRow);
      });

      //define keyboard shortcut event handler (Alt+B)
      document.querySelectorAll('textarea.wmd-input').forEach(elem => {
         elem.addEventListener('keydown', ev => {
            if (shortcutShouldFire(ev)) {
               ev.preventDefault();
               insertBlendFileDialog(this, EmbedURL);
            }
         });
      });

      waitForButtonRow();
   }

   // Repeatedly check for button rows and inject buttons into every one we find
   function waitForButtonRow() {
      console.log("waiting for button row..");

      function testForButtonRow() {
         if (counter > 60) {
            console.log("did not find a place to put blend button within 30 seconds. giving up.");
            return;
         }

         let button_rows = document.getElementsByClassName('wmd-button-row');

         if (button_rows.length <= 0) {
            setTimeout(testForButtonRow, 500);
            counter++;
            return;
         }

         for (button_row of button_rows) {
            //if no blend button already exists, inject one
            if (button_row.getElementsByClassName("wmd-blend-button").length == 0) {
               injectButton(button_row);
            }
         }
      }

      var counter = 0;
      setTimeout(testForButtonRow, 500);
   }

   function injectButton(buttonRow) {
      var blendButtonId = 'wmd-blend-button' + buttonRow.getAttribute("id").replace(/[^0-9]+/g, "");

      var li = document.createElement('li');
      li.setAttribute('id', blendButtonId);
      li.setAttribute('title', 'Upload .blend to Blend-Exchange (Alt+B)');
      li.classList.add('wmd-button', 'wmd-blend-button');

      var respond_to_click = true;
      li.addEventListener('click', () => {
         //prevent user from clicking too many times too quickly; ignore secondary clicks which occur within 500ms
        console.log(respond_to_click);
         if (respond_to_click == true) {
            respond_to_click = false;
            insertBlendFileDialog(li.parentNode.querySelector("div[class='wmd-container'] textarea"), EmbedURL);
            setTimeout(function() { respond_to_click = true }, 500);
         }
      });

      //insert out button after the image button
      let image_button = buttonRow.querySelector("#wmd-image-button");
      buttonRow.insertBefore(li, image_button.nextSibling);

      //Add image element with base64 encoded png icon
      let icon = document.createElement('img');
      icon.setAttribute('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V%2B0%2FAAABaFBMVEUAAAAAAA\
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

     	li.appendChild(icon);
   }

   function insertBlendFileDialog(txta, url) {
      //popup size
      var popupWidth = 640;
      var popupHeight = 400;

      var left = ((window.outerWidth/2)+window.screenX)-(popupWidth/2);
      var top = ((window.outerHeight/2)+window.screenY)-(popupHeight/2);

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
      console.log(embedCode);

      if (txta.selectionStart == null) return;
      //embed insertion getting fired multipole times investigate
      var start = txta.selectionStart;
      var end = txta.selectionEnd;
      var chars = txta.value;
      console.log("chars: " + chars);

      //separate selection from rest of body
      var pre = chars.slice(0, start);
      var post = chars.slice(end);

      //put everything back together again
      txta.value = pre + embedCode + post;

      //highlight newly added embed code
      txta.selectionStart = pre.length;
      txta.selectionEnd = pre.length + embedCode.length;

      txta.focus();

      updateMarkdownPreview(txta);

   }

   //function to force update the live markdown render
   function updateMarkdownPreview(element) {

      var keyboardEvent = document.createEvent("KeyboardEvent");
      var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";


      //horrible hack so undo after inserting blend tags only removes blend tags
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
