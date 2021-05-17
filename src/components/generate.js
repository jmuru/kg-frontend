import React from 'react';
import {getKatData} from '../util/dao';
import {applyColorPalette, getBackgroundColorMap, redrawFromMatrix, mergeLayers} from '../util/generator-helper';

export class Generator extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {Face: {}, Accessories: {}, Background: {}, Merged: null, ImgData: null}
    }
    _generateKat (e) {
        e.preventDefault();
        const data = getKatData();
        data.then(r => {
            console.log("data in promise", r);
            this.setState({
                Face: r["face"],
                Accessories: r["accessories"],
                Background: r["background"]
            });

            const face = applyColorPalette(this.state.Face["face"]["Face"],this.state.Face["palette"]["palette"])
            const background = getBackgroundColorMap(this.state.Background["background"]["Background"])
            const aGroup = {}
            // console.log('state accessories', Object.keys(this.state.Accessories))
            Object.keys(this.state.Accessories).forEach(placement => {
                if (this.state.Accessories[placement]) {
                    // console.log(this.state.Accessories[placement]["accessory"]["accessory"]);
                    // console.log(this.state.Accessories[placement]["palette"]["palette"]);
                    aGroup[placement] = applyColorPalette(this.state.Accessories[placement]["accessory"]["accessory"],this.state.Accessories[placement]["palette"]["palette"] )
                }
            });
            // console.log("formatted accessories", aGroup);
            let base = mergeLayers(background, face);
            // TODO: limit 2 random accessories to be rendered at most
            let a = Object.values(aGroup).reduce((acc, curr) => {
                return mergeLayers(acc, curr);
            })
            let combo = mergeLayers(base, a)
            redrawFromMatrix(combo, this.canvasRef.current.getContext("2d"));

            let imgData = this.canvasRef.current.toDataURL("image/png");
            console.log("converted image data", imgData);
            this.setState({
                Merged: combo,
                ImgData: imgData
            })
        })
    }

    _generateCanvas() {
        return (
            <div>
                <canvas ref={this.canvasRef} width={240} height={240} />
            </div>
        )
    }

    render () {
        return (
            <div>
                <button onClick={(e) => this._generateKat(e)}>Generate Kat</button>
                {this._generateCanvas()}
                <br/>
                {this.state.Merged && this.state.ImgData ? <a href={this.state.ImgData} download>Download Kat</a> : null}
            </div>
        )
    }
}