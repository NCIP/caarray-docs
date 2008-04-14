var DOCUMENTATION_TAG = "documentation";
var DESCRIPTION_TAG = "description";
var GENERATED_JAVA_DIR = "c:\\temp\\generated_java";

var wshShell = WScript.CreateObject("WScript.Shell");
var repository = WScript.CreateObject("EA.Repository");
var fso = WScript.CreateObject("Scripting.FileSystemObject");
mkdirs(GENERATED_JAVA_DIR);
var log = fso.CreateTextFile(GENERATED_JAVA_DIR + "\\log.txt");

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
        var element = package.Elements.GetAt(i);
        if (element.Type == "Class") {
            writeClass(package, element);
        }
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
    javaFile.WriteLine("package " + package.Name + ";");
}

function writeImports(javaFile, element) {
    javaFile.WriteLine();
}

function writeClassHeading(javaFile, element) {
    var documentation;
    if (!hasTaggedValue(DOCUMENTATION_TAG, element)) {
        log.WriteLine("WARN: " + element.Name + " has no documentation tagged value");
        documentation = element.Notes;
    } else {
        documentation = getTaggedValue(DOCUMENTATION_TAG, element);
    }
    javaFile.WriteLine("/**");
    javaFile.WriteLine(" * " + documentation);
    javaFile.WriteLine(" */");
    javaFile.Write("public class " + element.Name);
    if (element.BaseClasses.Count > 0) {
        javaFile.Write(" extends " + element.BaseClasses.GetAt(0).Name);
    }
    javaFile.Write(" {");
    javaFile.WriteLine();
}

function writeAttributes(javaFile, element) {
    javaFile.WriteLine();
    for (var i = 0; i < element.Attributes.Count; i++) {
        var attribute = element.Attributes.GetAt(i);
        javaFile.WriteLine("    private " + attribute.Type + " " + attribute.Name + ";");
    }
}

function writeAssociations(javaFile, element) {
    for (var i = 0; i < element.Connectors.Count; i++) {
        var connector = element.Connectors.GetAt(i);
        if (isAssociation(connector) && isOtherEndNavigable(element, connector)) {
            writeAssociation(javaFile, element, connector);
        }
    }
}

function writeAssociation(javaFile, element, connector) {
    var otherEnd = getOtherEnd(element, connector);
    var associatedClass = getOtherEndClass(element, connector);
    javaFile.WriteLine("    private " + associatedClass.Name + " " + otherEnd.Role + ";");
}

function isAssociation(connector) {
    return "Association" == connector.Type || "Aggregation" == connector.Type;
}

function isOtherEndNavigable(element, connector) {
    //return getOtherEnd(element, connector).isNavigable;
    return true;
}

function getOtherEnd(element, connector) {
    if (isClientEnd(element, connector)) {
        return element.SupplierEnd;
    } else {
        return element.ClientEnd;
    }
}

function getOtherEndClass(element, connector) {
    if (isClientEnd(element, connector)) {
        return repository.GetElementByID(element.SupplierID);
    } else {
        return repository.GetElementByID(element.ClientID);
    }
}

function isClientEnd(element, connector) {
    return connector.ClientID == element.ElementID;
}

function writeGettersAndSetters(javaFile, element) {
    javaFile.WriteLine();
    for (var i = 0; i < element.Attributes.Count; i++) {
        var attribute = element.Attributes.GetAt(i);
        var documentation;
        if (!hasTaggedValue(DESCRIPTION_TAG, attribute)) {
            log.WriteLine("WARN: " + element.Name + "." + attribute.name + " has no description tagged value");
            documentation = attribute.Notes;
        } else {
            documentation = getTaggedValue(DESCRIPTION_TAG, attribute);
        }
        javaFile.WriteLine("    /**");
        javaFile.WriteLine("     * Getter for " + attribute.Name + ": " + documentation);
        javaFile.WriteLine("     */");
        javaFile.WriteLine("    public " + attribute.Type + " get" + getInitialUpper(attribute.Name) + "() {");
        javaFile.WriteLine("        return " + attribute.Name + ";");
        javaFile.WriteLine("    }");
        javaFile.WriteLine();
        javaFile.WriteLine("    /**");
        javaFile.WriteLine("     * Setter for " + attribute.Name + ": " + documentation);
        javaFile.WriteLine("     */");
        javaFile.WriteLine("    public void set" + getInitialUpper(attribute.Name) + "(" + attribute.Type + " " + attribute.Name + ") {");
        javaFile.WriteLine("        this." + attribute.Name + " = " + attribute.Name + ";");
        javaFile.WriteLine("    }");
        javaFile.WriteLine();
    }
}

function getInitialUpper(value) {
    return value.charAt(0).toUpperCase() + value.substring(1, value.length);
}

function writeClassEnd(javaFile) {
    javaFile.WriteLine("}");
}

function createJavaFile(package, element) {
    var directoryPath = GENERATED_JAVA_DIR + "\\" + getDirectoryPath(package);
    mkdirs(directoryPath);
    var filename = directoryPath + "\\" + element.Name + ".java";
    log.WriteLine("Creating java file " + filename);
    return fso.CreateTextFile(filename, true);
}

function mkdirs(path) {
    var pathElements = path.split("\\");
    var currentPath = pathElements[0];
    for (i = 1; i < pathElements.length; i++) {
        currentPath += "\\" + pathElements[i];
        if (!fso.FolderExists(currentPath)) {
            fso.CreateFolder(currentPath);
        }
    }
}

function getDirectoryPath(package) {
    return package.Name.replace(/\./g, "\\");
}

function hasTaggedValue(tagName, parent) {
    for (var i = 0; i < parent.TaggedValues.Count; i++) {
        var tag = parent.TaggedValues.GetAt(i);
        if (tag.Name == tagName) {
            return true;
        }
    }
    return false;
}

function getTaggedValue(tagName, parent) {
    for (var i = 0; i < parent.TaggedValues.Count; i++) {
        var tag = parent.TaggedValues.GetAt(i);
        if (tag.name == tagName) {
            return tag.Value;
        }
    }
    return "";
}

function alert(message) {
    wshShell.Popup(message);
}

function confirm(message) {
    return wshShell.Popup(message, 9999, "Confirm", 33) == 1;
}