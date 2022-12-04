import {useCallback, useReducer} from "react";


const formReducer = (state, action) => {
    switch(action.type) {
        case "INPUT_CHANGE":
            let formIsValid = true;
            //loop through all inputs to check if valid
            for(const inputId in state.inputs){
                if(!state.inputs[inputId]){
                    continue;
                }
                //check input nao la cai can edit with action
                if(inputId === action.inputId){
                    formIsValid = (formIsValid && action.isValid);
                } else {
                    formIsValid = (formIsValid && state.inputs[inputId].isValid);
                }
            }
            return {
                ...state,
                inputs: {
                    ...state.inputs,
                //update cai input dc dispatch action voi values moi
                [action.inputId] : { //title hoac decription
                    value: action.value, 
                    isValid: action.isValid }
                } ,
                isValid: formIsValid
            };
        case "SET_DATA":
            return {
                inputs: action.inputs,
                isValid: action.formIsValid
            };
        default:
            return state;
    }
}


export const useForm = (initialInputs, initialFormValidity) => {
    const[formState, dispatch] = useReducer(formReducer, {
        //initial state
        inputs: initialInputs,
        //isValid of the overall form
        isValid: initialFormValidity
    });

    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            type: "INPUT_CHANGE", 
            inputId: id, 
            value: value, 
            isValid: isValid  })
    },[]);

    //fetch data
    const setFormData = useCallback((inputData, formValidity) => {
        dispatch({
            type: "SET_DATA",
            inputs: inputData,
            formIsValid: formValidity
        })
    }, []);

    return [formState, inputHandler, setFormData]
}