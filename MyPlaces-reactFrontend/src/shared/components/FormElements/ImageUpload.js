import React, {useRef, useState, useEffect} from "react";

import Button from "./Button"
import "./ImageUpload.css"

const ImageUpload = props => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const[isValid, setIsValid] = useState(false);

    const filePickerRef = useRef();


    //when picked a new file, run this useEffect func
    useEffect(()=> {
        if(!file){
            return;
        }
        const fileReader = new FileReader(); //read file
        fileReader.onload = () => { //callback. excecute when complete load
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(file);
    }, [file]);

    //create preview image and pass image to the form
    const pickedHandler = event => {
        let pickedFile;
        let fileIsValid = isValid;
        if(event.target.files && event.target.files.length === 1){
            pickedFile = event.target.files[0];
            setFile(pickedFile);
            setIsValid(true);
            fileIsValid = true;
        }else{
            setIsValid(false);
            fileIsValid= false;
        }
       props.onInput(props.id, pickedFile, fileIsValid)
    };

    const pickImageHandler = () => {
        //click func la cua input dom node de open file picker
        filePickerRef.current.click();  //useRef de connect button va input
    };
    return (
        <div className="form-control">
            <input 
            id={props.id} 
            ref={filePickerRef}
            type="file" //input cho upload file
            style={{display: "none"}}
            accept=".jpg,.png,.jpeg"
            onChange={pickedHandler}
            />

            <div className={`image-upload ${props.center && "center"}`}>
                <div className="image-upload__preview">
                    {previewUrl && <img src={previewUrl} alt="Preview" />}
                    {!previewUrl && <p>PLease pick an image</p>}
                </div>
                <Button onClick={pickImageHandler} type="button">PICK IMAGE</Button>
            </div>
            {!isValid && <p>{props.errorText}</p>}
        </div>

    )
}

export default ImageUpload;