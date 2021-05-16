import axios from 'axios';

const SERVER_URL_BASE = "";



export async function postAccessoryData (placement, subType, aData) {
    const url = `/api/accessory/create`;
    if (window.confirm(`Are you sure you eant to save this accessory as sub type ${subType} and placement ${placement}`)) {
       const response = await axios.post(url, {
           headers: {
               'Content-Type': 'application/json',
           },
           data: {
               placement: placement,
               subType: subType,
               accessory: aData
           }
       });
        console.log("create kat accessory response", response.status);
    }
}

export async function getKatData () {
    const url = `/api/generate/kat`;
    const response = await axios.get(url);
    console.log("generate cat response status", response.status);
    return response.data;
}
