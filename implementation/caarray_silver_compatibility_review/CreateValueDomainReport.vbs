Const VALUE_DOMAIN_TAG = "CADSR Local Value Domain"
Const REVIEWED_TAG = "CURATOR_REVIEWED"

Set fso = CreateObject("Scripting.FileSystemObject")
Set outputFile = fso.CreateTextFile("C:\silver\value_domain_report.csv", True)

Dim theClassFromPackage

Set repository = CreateObject("EA.Repository")
repository.OpenFile("C:\ncicb_svn\caarray2\docs\analysis_and_design\models\caarray_client_model.eap")
WriteHeader()
WriteAllPackages()

outputFile.Close()
repository.Exit()
Set repository = Nothing
Wscript.Echo "Done"

Sub WriteHeader()
	outputFile.WriteLine("UML Class,UML Entity,Data Type,Verified,Enumerated,Valid Values,Comment Definition")
End Sub

Sub WriteAllPackages()
	For Each package in repository.Models
		WritePackage package
	Next
End Sub

Sub WritePackage(package)
	For Each subpackage in package.Packages
		WritePackage subpackage
	Next
	WriteClasses package
End Sub

Sub WriteClasses(package)
	For Each element in package.Elements
		WriteClass package, element
	Next
End Sub

Sub WriteClass(package, element)
	For Each attribute in element.Attributes
		WriteAttribute package, element, attribute
	Next
End Sub

Sub WriteAttribute(package, element, attribute) 
	outputFile.Write(package.Name & "." & element.Name)
	outputFile.Write(",")
	outputFile.Write(attribute.Name)
	outputFile.Write(",")
	outputFile.Write(GetAttributeType(attribute))
	outputFile.Write(",")
	outputFile.Write(GetVerifiedValue(attribute))
	outputFile.Write(",")
	outputFile.Write(GetEnumeratedValue(attribute))
	outputFile.WriteLine
End Sub

Function GetEnumeratedValue(attribute)
	If HasTaggedValue(VALUE_DOMAIN_TAG, attribute) Then
		Set valueDomainClass = GetValueDomainClass(attribute)
		GetEnumeratedValue = GetTaggedValue(ENUMERATED_TAG, attribute)
	Else
		GetEnumeratedValue = 0
	End If
End Function

Function GetValueDomainClass(attribute)
	Set GetValueDomainClass = GetClassByName(GetTaggedValue(VALUE_DOMAIN_TAG, attribute))
End Function

Function GetClassByName(className)
	For Each package in repository.Models
		GetClassByNameFromPackage package, className
		Set GetClassByName = theClassFromPackage
		Set theClassFromPackage = Nothing
		Exit For
	Next
End Function

Sub GetClassByNameFromPackage(package, className)
	For Each element in package.Elements
		If element.Name = className Then
			Set theClassFromPackage = element
			Exit Sub
		End If
	Next
	For Each subpackage in package.Packages
		GetClassByNameFromPackage subpackage, className
	Next
End Sub

Function GetAttributeType(attribute)
	If HasTaggedValue(VALUE_DOMAIN_TAG, attribute) Then
		GetAttributeType = GetTaggedValue(VALUE_DOMAIN_TAG, attribute)
	Else
		GetAttributeType = attribute.Type
	End If
End Function

Function GetVerifiedValue(attribute)
	GetVerifiedValue = GetTaggedValue(REVIEWED_TAG, attribute) 
End Function

Function HasTaggedValue(tagName, attribute)
	HasTaggedValue = False
	For Each attributeTag in attribute.TaggedValues
		If attributeTag.Name = tagName Then
			HasTaggedValue = True
			Exit For
		End If
	Next
End Function

Function GetTaggedValue(tagName, attribute)
	GetTaggedValue = ""
	For Each attributeTag in attribute.TaggedValues
		If attributeTag.Name = tagName Then
			GetTaggedValue = attributeTag.Value
			Exit For
		End If
	Next
End Function