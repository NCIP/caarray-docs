var DOCUMENTATION_TAG = "documentation";
var DESCRIPTION_TAG = "description";
var GENERATED_JAVA_DIR = "c:\\temp\\generated_java";

var wshShell = WScript.CreateObject("WScript.Shell");
var repository = WScript.CreateObject("EA.Repository");
var fso = WScript.CreateObject("Scripting.FileSystemObject");

main();

function main() {
    repository = WScript.CreateObject("EA.Repository")
    var fileOpened = repository.OpenFile("C:\\ncicb_svn\\caarray2\\docs\\analysis_and_design\\models\\caarray_client_model.eap")
    if (!fileOpened) {
        alert("Unable to open model file");
        return;
    }
    writeAllClasses();
    repository.Exit();
    repository = null;
    alert("Done");
}

function writeAllClasses() {
    for (var i = 0; i < repository.Models.Count; i++) {
        writePackage(repository.Models.GetAt(i));
    }
}

function writePackage(package) {
    for (var i = 0; i < package.Packages.Count; i++) {
        writePackage(package.Packages.GetAt(i));
    }
    writeClasses(package);
}

function writeClasses(package) {
    for (var i = 0; i < package.Elements.Count; i++) {
        writeClass(package, package.Elements.GetAt(i));
    }
}

function writeClass(package, element) {
    var javaFile = createJavaFile(package, element);
    writePackageStatement(javaFile, package);
    writeImports(javaFile, element);
    writeClassHeading(javaFile, element);
    writeAttributes(javaFile, element);
    writeAssociations(javaFile, element);
    writeGettersAndSetters(javaFile, element);
    writeClassEnd(javaFile);
}

function writePackageStatement(javaFile, package) {
    outputFile.WriteLine("package " + package.Name + ";");
}

function writeImports(javaFile, element) {
    outputFile.WriteLine();
}

function writeClassHeading(javaFile, element) {
    outputFile.WriteLine("/**");
    outputFile.WriteLine(" * " + element.Notes);
    outputFile.WriteLine(" */");
    outputFile.WriteLine("public class " + element.Name + " {");
}

function writeAttributes(javaFile, element) {
    outputFile.WriteLine();
}

function writeAssociations(javaFile, element) {
    outputFile.WriteLine();
}

function writeGettersAndSetters(javaFile, element) {
    outputFile.WriteLine();
}

function writeClassEnd(javaFile) {
    outputFile.WriteLine("}");
}

function createJavaFile(package, element) {
    var directoryPath = GENERATED_JAVA_DIR + "\\" + getDirectoryPath(package);
    if (!fso.FolderExists(directoryPath)) {
        fso.CreateFolder(directoryPath);
    }
    return fso.CreateTextFile(directoryPath + "\\" + element.Name + ".java", true);
}

function getDirectoryPath(package) {
    return package.Name.replace("\.", "\\\\");
}

function writeClassNotes(element) {
    if (hasTaggedValue(DOCUMENTATION_TAG, element)) {
        element.Notes = getTaggedValue(DOCUMENTATION_TAG, element);
    }
}

function writeAttribute(attribute) {
    if (hasTaggedValue(DESCRIPTION_TAG, attribute)) {
        attribute.Notes = getTaggedValue(DESCRIPTION_TAG, attribute);
    }
}

function alert(message) {
    wshShell.Popup(message);
}

function confirm(message) {
    return wshShell.Popup(message, 9999, "Confirm", 33) == 1;
}