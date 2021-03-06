(function()
{
	function SavingFile(bytesLength)
	{
		var _p = SavingFile.prototype = this;
		
		this.blobBuilder = new BlobBuilder();
		this.arrayBuffer = new ArrayBuffer(bytesLength);
		this.dataView = new DataView(this.arrayBuffer);
		
		this.save = function(filePath)
		{
			this.blobBuilder.append(this.arrayBuffer);
			var blob = this.blobBuilder.getBlob("example/binary");
			//var blob = this.blobBuilder.getBlob("text/plain");
			saveAs(blob, filePath);
		};	
	}
	window.SavingFile = SavingFile;
}());

(function()
{
	
	var FileHandler = function(){};
	
	FileHandler.saveTextFile = function(fileName, text)
	{
		//var textToWrite = "ffaacc";
		var textFileAsBlob = new Blob([text], {type:'text/plain'});
	
		var downloadLink = document.createElement("a");
		downloadLink.download = fileName;
		downloadLink.innerHTML = "Download File";
		if (window.webkitURL != null)
		{
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		}
		else
		{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}
		
		function destroyClickedElement(event)
		{
			document.body.removeChild(event.target);
		}
	
		downloadLink.click();
	};

	FileHandler.loadFromServer = function(filePath, cb_yes, cb_no)
	{
		console.log("read from server");
		
		var errorMessage = "unknown error";
		
		var oReq = new XMLHttpRequest();
		oReq.open("GET", filePath, true);
		oReq.responseType = "blob";
			
		oReq.onload = function(evt)
		{
			console.log("file load statusText = " + oReq.statusText);
			if(oReq.status == 200)
			{
				console.log("response = " + oReq.response);
				var blob = oReq.response;
				//FileHandler.read(blob, cb_yes);
				console.log("blob = " + blob);
				if(cb_yes != null) cb_yes.apply(null, [blob]);
			}
			else
			{
				errorMessage = "fail on loading file, request status = " + oReq.status;
				if(cb_no != null) cb_no.apply(null, [errorMessage]);
			}
		};
		
		oReq.send(null);
	}
	
	/*	read a file or blob, return data type is depand on readMethod params
	
		fileOrBlob		a file or blob instance
		readMethod		a read method which supported by FileReader, possible read methods listed in FileHandler.readMethods
	*/
	FileHandler.read = function(fileOrBlob, cb, readMethod)
	{
		if(readMethod == null) readMethod = "readAsBinaryString";
		if(!FileHandler.readMethods[readMethod]) console.error("illegal read method: " + readMethod);
		
		var fr = new FileReader();
		fr.onload = receivedBinary;
		fr[readMethod](fileOrBlob);
				
		function receivedBinary() 
		{
			if(cb != null) cb.apply(null, [fr.result]);
		}
	}
	
	FileHandler.readMethods = {};
	FileHandler.readMethods.readAsArrayBuffer = "readAsArrayBuffer";
	FileHandler.readMethods.readAsBinaryString = "readAsBinaryString";
	FileHandler.readMethods.readAsDataURL = "readAsDataURL";
	FileHandler.readMethods.readAsText = "readAsText";
	
	window.FileHandler = FileHandler;

}());