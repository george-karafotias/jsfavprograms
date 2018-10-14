const ROWEDITMODECLASS = "rowEditMode";
const DISPLAYINLINE = "inline";
const DISPLAYBLOCK = "block";
const DISPLAYNONE = "none";
const EDITBUTTON = "Edit";
const DELETEBUTTON = "Delete";
const SAVEBUTTON = "Save";
const CANCELBUTTON = "Cancel";

var addProgramButton = document.getElementById("addProgram");
var deleteAllButton = document.getElementById("deleteAll");
var addProgramForm = document.getElementById("addProgramForm");
var addProgramErrorText = document.getElementById("addProgramError");
var programNameText = document.getElementById("programName");
var programWebsiteText = document.getElementById("programWebsite");
var programDescriptionText = document.getElementById("programDescription");
var saveProgramButton = document.getElementById("saveProgram");
var cancelAddProgramButton = document.getElementById("cancelAddProgram");
var resultsDiv = document.getElementById("results");
var programsTable = document.getElementById("programs");

var programs = window.localStorage.getItem("programs");
if (programs === "undefined" || programs === null)
    programs = [];
else
    programs = JSON.parse(programs);

hideAddProgramForm();
displayPrograms();

function hideAddProgramForm() {
    addProgramForm.style.display = "none";
}

function noPrograms() {
    return (programs === "undefined" || programs === null || programs.length == 0);
}

function savePrograms() {
    window.localStorage.setItem("programs", JSON.stringify(programs));
}

function programWebsite(website) {
    return "<span><a href='" + website + "' target='_blank'>" + website + "</a></span><input type='text' style='display:none' value='" + website + "'/>";
}

function findProgram(programId) {
    if (noPrograms()) {
        return -1;
    }
    for (var i = 0; i < programs.length; i++) {
        if (programs[i].id == programId)
            return i;
    }
    return -1;
}

function deleteProgram(programRow) {
    var programIndex = findProgram(programRow.id);
    if (programIndex !== -1) {
        programs.splice(programIndex, 1);
        savePrograms();
        document.getElementById(programRow.id).remove();
    }
}

function saveProgramRow(programRow) {
    var cells = programRow.cells;
    var nameCellChildren = cells[0].childNodes;
    var websiteCellChidren = cells[1].childNodes;
    var descriptionCellChildren = cells[2].childNodes;

    var programId = programRow.id;
    var newProgramName = nameCellChildren[1].value.trim();
    var newProgramWebsite = websiteCellChidren[1].value.trim();
    var newProgramDescription = descriptionCellChildren[1].value;
    if (newProgramName === "" || newProgramWebsite === "") {
        return false;
    }
    for (var i = 0; i < programs.length; i++) {
        if (programs[i].id == programId) {
            programs[i].name = newProgramName;
            programs[i].website = newProgramWebsite;
            programs[i].description = newProgramDescription;
            break;
        }
    }

    savePrograms();

    nameCellChildren[0].innerHTML = newProgramName;
    websiteCellChidren[0].innerHTML = programWebsite(newProgramWebsite);
    descriptionCellChildren[0].innerHTML = newProgramDescription;

    return true;
}

function setRowMode(programRow, visibleIndex, hiddenIndex, editButtonText, deleteButtonText) {
    var cells = programRow.cells;
    var nameCellChildren = cells[0].childNodes;
    var websiteCellChidren = cells[1].childNodes;
    var descriptionCellChildren = cells[2].childNodes;
    var children = [nameCellChildren, websiteCellChidren, descriptionCellChildren];
    for (var i = 0; i < children.length; i++) {
        children[i][visibleIndex].style.display = DISPLAYINLINE;
        children[i][hiddenIndex].style.display = DISPLAYNONE;
    }
    var editButton = cells[3].childNodes[0];
    var deleteButton = cells[4].childNodes[0];
    editButton.innerHTML = editButtonText;
    deleteButton.innerHTML = deleteButtonText;
}

function setEditMode(programRow) {
    setRowMode(programRow, 1, 0, SAVEBUTTON, CANCELBUTTON);
    programRow.className = ROWEDITMODECLASS;
}

function cancelEditMode(programRow) {
    setRowMode(programRow, 0, 1, EDITBUTTON, DELETEBUTTON);
    programRow.classList.remove(ROWEDITMODECLASS);
}

function editOrSaveProgram(programRow) {
    if (programRow === undefined || programRow === null) {
        return;
    }
    if (programRow.className === ROWEDITMODECLASS) {
        if (saveProgramRow(programRow))
            cancelEditMode(programRow);
    } else {
        setEditMode(programRow);
    }
}

function deleteOrCancelProgram(programRow) {
    if (programRow === undefined || programRow === null) {
        return;
    }
    if (programRow.className === ROWEDITMODECLASS) {
        cancelEditMode(programRow);
    } else {
        deleteProgram(programRow);
        if (noPrograms()) {
            displayNoPrograms();
        }
    }
}

function insertProgramRow(program) {
    var row = programsTable.insertRow(-1);
    var nameCell = row.insertCell(0);
    var websiteCell = row.insertCell(1);
    var descriptionCell = row.insertCell(2);
    var editCell = row.insertCell(3);
    var deleteCell = row.insertCell(4);
    nameCell.className = "programName";
    websiteCell.className = "programWebsite";
    descriptionCell.className = "programDescription";
    row.id = program.id;
    nameCell.innerHTML = "<span>" + program.name + "</span><input type='text' style='display:none' value='" + program.name + "'/>";
    websiteCell.innerHTML = programWebsite(program.website);
    descriptionCell.innerHTML = "<span>" + program.description + "</span><input type='text' style='display:none' value='" + program.description + "'/>";
    editCell.innerHTML = "<button class='posButton' onclick=editOrSaveProgram(this.parentNode.parentNode)>" + EDITBUTTON + "</button>";
    deleteCell.innerHTML = "<button class='negButton' onclick=deleteOrCancelProgram(this.parentNode.parentNode)>" + DELETEBUTTON + "</button>";
}

function displayNoPrograms() {
    resultsDiv.style.display = DISPLAYNONE;
    deleteAllButton.style.display = DISPLAYNONE;
}

function displayPrograms() {
    if (noPrograms()) {
        displayNoPrograms();
        return;
    }
    programs.forEach(function (program) {
        insertProgramRow(program);
    });
    if (resultsDiv.style.display == DISPLAYNONE) {
        resultsDiv.style.display = DISPLAYBLOCK;
        deleteAllButton.style.display = "";
    }
}

function searchForPrograms() {
    var input, filter, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase().trim();
    tr = programsTable.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        if (td !== "undefined" && td.length>3) {
            if (td[0].innerHTML.toUpperCase().indexOf(filter)>-1 || td[1].innerHTML.toUpperCase().indexOf(filter)>-1 || td[2].innerHTML.toUpperCase().indexOf(filter)>-1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = DISPLAYNONE;
            }
        }
    }
}

function deleteProgramRows() {
    var rowCount = programsTable.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        programsTable.deleteRow(i);
    }
}

addProgramButton.addEventListener("click", function () {
    programNameText.value = "";
    programWebsiteText.value = "";
    programDescriptionText.value = "";
    addProgramErrorText.innerHTML = "";
    addProgramForm.style.display = "block";
    programNameText.focus();
});

saveProgramButton.addEventListener("click", function () {
    var programId = programs.length + 1;
    var programName = programNameText.value.trim();
    var programWebsite = programWebsiteText.value.trim();
    var programDescription = programDescriptionText.value.trim();
    if (programName === "" || programWebsite === "") {
        addProgramErrorText.innerHTML = "Please enter both name and website.";
        return;
    }

    var program = { id: programId, name: programName, website: programWebsite, description: programDescription };
    programs.push(program);
    savePrograms();

    hideAddProgramForm();
    insertProgramRow(program);
    searchForPrograms();
    if (resultsDiv.style.display == DISPLAYNONE) {
        resultsDiv.style.display = DISPLAYBLOCK;
        deleteAllButton.style.display = "";
    }
});

cancelAddProgramButton.addEventListener("click", function () {
    hideAddProgramForm();
});

deleteAllButton.addEventListener("click", function(){
    if (confirm('Are you sure you want to delete the entire database?')) {
        window.localStorage.removeItem("programs");
        programs = [];
        deleteProgramRows();
        document.getElementById("myInput").value = "";
        displayNoPrograms();
    }
});
