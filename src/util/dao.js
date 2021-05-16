import axios from 'axios';

const SERVER_URL_BASE = "reigncat-generator.herokuapp.com";

export function postAccessoryData (placement, subType, aData) {
    const url = `${SERVER_URL_BASE}/accessory/create`
    if (window.confirm(`Are you sure you eant to save this accessory as sub type ${subType} and placement ${placement}`)) {
        axios.post(url,{
            placement: placement,
            subType: subType,
            accessory: aData
        });
    }

}

export async function getKatData () {
    const url = `${SERVER_URL_BASE}/api/generate/kat`;
    const response = await axios.get(url);
    console.log("generate cat response status", response.status);
    return response.data;
}
