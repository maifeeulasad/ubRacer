/**
 * Blockly Apps: ubRacer
 *
 * Copyright 2014 Zero & One Computing Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for ubRacer Blockly application.
 * @author yoyo@zeroandone.ca (Yossarian King)
 */

// Supported languages.
BlocklyApps.LANGUAGES =
    ['ace', 'ar', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fr', 'he',
     'hrx', 'hu', 'is', 'it', 'ko', 'mg', 'ms', 'nl', 'pl', 'pms', 'pt-br',
     'ro', 'ru', 'sco', 'sr', 'sv', 'th', 'tlh', 'tr', 'uk', 'vi', 'zh-hans',
     'zh-hant'];
BlocklyApps.LANG = BlocklyApps.getLang();

document.write('<script type="text/javascript" src="generated/' + BlocklyApps.LANG + '.js"></script>\n');

/**
 * Create a namespace for the application.
 */
var UBR = {};

/**
 * List of tab names.
 * @private
 */
UBR.TABS_ = ['blocks', 'javascript', 'python', 'dart', 'xml'];

UBR.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
UBR.tabClick = function(clickedName) {
    // If the XML tab was open, save and render the content.
    if (document.getElementById('tab_xml').className == 'tabon') {
        var xmlTextarea = document.getElementById('content_xml');
        var xmlText = xmlTextarea.value;
        var xmlDom = null;
        try {
            xmlDom = Blockly.Xml.textToDom(xmlText);
        } catch (e) {
            var q =
                window.confirm(BlocklyApps.getMsg('Code_badXml').replace('%1', e));
            if (!q) {
                // Leave the user on the XML tab.
                return;
            }
        }
        if (xmlDom) {
            Blockly.mainWorkspace.clear();
            Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
        }
    }

    // Deselect all tabs and hide all panes.
    for (var i = 0; i < UBR.TABS_.length; i++) {
        var name = UBR.TABS_[i];
        document.getElementById('tab_' + name).className = 'taboff';
        document.getElementById('content_' + name).style.visibility = 'hidden';
    }

    // Select the active tab.
    UBR.selected = clickedName;
    document.getElementById('tab_' + clickedName).className = 'tabon';
    // Show the selected pane.
    document.getElementById('content_' + clickedName).style.visibility = 'visible';
    UBR.renderContent();
    Blockly.fireUiEvent(window, 'resize');
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
UBR.renderContent = function() {
    var content = document.getElementById('content_' + UBR.selected);
    // Initialize the pane.
    if (content.id == 'content_xml') {
        var xmlTextarea = document.getElementById('content_xml');
        var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
        xmlTextarea.value = xmlText;
        xmlTextarea.focus();
    } else if (content.id == 'content_javascript') {
        var code = Blockly.JavaScript.workspaceToCode();
        content.textContent = code;
        if (typeof prettyPrintOne == 'function') {
            code = content.innerHTML;
            code = prettyPrintOne(code, 'js');
            content.innerHTML = code;
        }
    } else if (content.id == 'content_python') {
        code = Blockly.Python.workspaceToCode();
        content.textContent = code;
        if (typeof prettyPrintOne == 'function') {
            code = content.innerHTML;
            code = prettyPrintOne(code, 'py');
            content.innerHTML = code;
        }
    } else if (content.id == 'content_dart') {
        code = Blockly.Dart.workspaceToCode();
        content.textContent = code;
        if (typeof prettyPrintOne == 'function') {
            code = content.innerHTML;
            code = prettyPrintOne(code, 'dart');
            content.innerHTML = code;
        }
    }
};

/**
 * Initialize Blockly.  Called on page load.
 */
UBR.init = function() {
    BlocklyApps.init();

    var rtl = BlocklyApps.isRtl();
    var container = document.getElementById('content_area');
    var onresize = function(e) {
        var bBox = BlocklyApps.getBBox_(container);
        for (var i = 0; i < UBR.TABS_.length; i++) {
            var el = document.getElementById('content_' + UBR.TABS_[i]);
            el.style.top = bBox.y + 'px';
            el.style.left = bBox.x + 'px';
            // Height and width need to be set, read back, then set again to
            // compensate for scrollbars.
            el.style.height = bBox.height + 'px';
            el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
            el.style.width = bBox.width + 'px';
            el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
        }
        // Make the 'Blocks' tab line up with the toolbox.
        if (Blockly.Toolbox.width) {
            document.getElementById('tab_blocks').style.minWidth =
                (Blockly.Toolbox.width - 38) + 'px';
                // Account for the 19 pixel margin and on each side.
        }
    };
    window.addEventListener('resize', onresize, false);

    var toolbox = document.getElementById('toolbox');
    Blockly.inject(document.getElementById('content_blocks'),
      {path: '../../',
       rtl: rtl,
       toolbox: toolbox});

    // Add to reserved word list: Local variables in execution evironment (runJS)
    // and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');

    BlocklyApps.loadBlocks('');
    
    UBR.loadWorkspace();

    if ('BlocklyStorage' in window) {
        // Hook a save function onto unload.
        BlocklyStorage.backupOnUnload();
    }

    UBR.tabClick(UBR.selected);
    
    Blockly.fireUiEvent(window, 'resize');

    BlocklyApps.bindClick('runButton', UBR.runJS);
    BlocklyApps.bindClick('saveButton', UBR.saveWorkspace);
    BlocklyApps.bindClick('loadButton', UBR.loadWorkspace);
    BlocklyApps.bindClick('trashButton', function() {UBR.discard(); UBR.renderContent();});

    for (var i = 0; i < UBR.TABS_.length; i++) {
        var name = UBR.TABS_[i];
        BlocklyApps.bindClick('tab_' + name,
            function(name_) {return function() {UBR.tabClick(name_);};}(name));
    }

    // Lazy-load the syntax-highlighting.
    window.setTimeout(BlocklyApps.importPrettify, 1);
};

window.addEventListener('load', UBR.init);

/**
 * Execute the user's code using javascript interpreter.
 */
UBR.runJS = function() {

    // TODO: halt any existing interpreter
    // see view-source:https://blockly-demo.appspot.com/static/demos/interpreter/index.html  
    // I think enough to put the interpreter in a global variable and over-write it on each run
  
    var code = Blockly.JavaScript.workspaceToCode();
    var interpreter = new Interpreter(code, ubRacer.initBlocklyInterpreter);

    // TODO: is fixed step counter per "tick" ok or should I use some sort of timer?
    var running = true;
    var stepInterpreter = function() {
        var steps = 100;
        while (running && (steps > 0)) {
            running = interpreter.step();
            steps--;
        }
    }
  
    window.setInterval(stepInterpreter, 1);
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 * NOT USED. (Don't be Eval)
 */
UBR.runJS_EVAL = function() {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '  checkTimeout();\n';
    var timeouts = 0;
    var checkTimeout = function() {
        if (timeouts++ > 1000000) {
            throw BlocklyApps.getMsg('Code_timeout');
        }
    };
    var code = Blockly.JavaScript.workspaceToCode();
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    try {
        eval(code);
    } catch (e) {
        alert(BlocklyApps.getMsg('Code_badCode').replace('%1', e));
    }
};

/**
 * Save the user's code as XML in local storage.
 * TODO: support for multiple named saves (and load)
 */
UBR.saveWorkspace = function() {
    if (localStorage == null) {
        alert("Your browser does not support local storage. Can't save workspace.");
        return;
    }
    
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    
    localStorage.setItem("uBlockly.document.xml.default", xmlText);
};

/**
 * Load user's code from local storage to workspace.
 */
UBR.loadWorkspace = function() {
    if (localStorage == null) {
        alert("Your browser does not support local storage. Can't load workspace.");
        return;
    }
    
    var xmlText = localStorage.getItem("uBlockly.document.xml.default");
    if (xmlText == null) {
        xmlText = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
    }
    
    Blockly.mainWorkspace.clear();
    xmlDom = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
};

/**
 * Discard all blocks from the workspace.
 */
UBR.discard = function() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 ||
      window.confirm(BlocklyApps.getMsg('Code_discard').replace('%1', count))) {
    Blockly.mainWorkspace.clear();
    window.location.hash = '';
  }
};
