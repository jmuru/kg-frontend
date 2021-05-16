import React from "react";
import {Uploader} from "../components/upload";

export class CreateAccessory extends React.Component {
    render() {
        return ( <div>
                <h1>Create Accessory</h1>
                <Uploader></Uploader>
            </div>
        );

    }
}