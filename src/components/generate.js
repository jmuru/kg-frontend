import React from 'react';
import {getKatData, getPalette} from '../util/dao';
import {applyColorPalette, getBackgroundColorMap, redrawFromMatrix, mergeLayers} from '../util/generator-helper';

export class Generator extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {Face: {}, Accessories: {}, Background: {}, Merged: null, ImgData: null, ActiveAccessories: []}
    }


    _redrawAccessory (placement) {
        const editCoord = applyColorPalette(this.state.Accessories[placement]["accessory"]["accessory"],this.state.Accessories[placement]["palette"]["palette"] )
        let combo = mergeLayers(this.state.Merged, editCoord)
        redrawFromMatrix(combo, this.canvasRef.current.getContext("2d"));
        let imgData = this.canvasRef.current.toDataURL("image/png");
        this.setState({
            Merged: combo,
            ImgData: imgData
        })
    }

    _drawInitialKat () {
        const face = applyColorPalette(this.state.Face["face"]["Face"],this.state.Face["palette"]["palette"])
        const background = getBackgroundColorMap(this.state.Background["background"]["Background"])
        const aGroup = {}
        Object.keys(this.state.Accessories).forEach(placement => {
            if (this.state.Accessories[placement]) {
                aGroup[placement] = applyColorPalette(this.state.Accessories[placement]["accessory"]["accessory"],this.state.Accessories[placement]["palette"]["palette"] )
            }
        });
        let base = mergeLayers(background, face);
        let ags = Object.values(aGroup);
        let agk = Object.keys(aGroup);
        let agsIndex = Math.floor(Math.random() * ags.length);
        ags.splice(agsIndex, 1);
        agk.splice(agsIndex, 1);
        let a = ags.reduce((acc, curr) => {
            return mergeLayers(acc, curr);
        })
        let combo = mergeLayers(base, a)
        redrawFromMatrix(combo, this.canvasRef.current.getContext("2d"));

        let imgData = this.canvasRef.current.toDataURL("image/png");
        console.log("converted image data", imgData);
        this.setState({
            ActiveAccessories: agk,
            Merged: combo,
            ImgData: imgData
        })
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
            this._drawInitialKat();
        })
    }

    _generateAccessoryPalette (type, placement) {
        const data = getPalette(type);
        data.then(r => {
            console.log('response', r["palette"]);
            console.log('response', r["type"]);
            let ac = this.state.Accessories;
            ac[placement]["palette"]["palette"] = r["palette"];
            this.setState({
                Accessories: ac,
            });
            this._redrawAccessory(placement);
        })
    }

    _generateCanvas() {
        return (
            <div>
                <canvas ref={this.canvasRef} width={240} height={240} />
            </div>
        )
    }

    _handleAccessoryPaletteChange(e, placment) {
        e.preventDefault();
        this._generateAccessoryPalette("accessory", placment);
    }

    _generatePaletteSwitchBtns () {
        let activeAccessories = this.state.ActiveAccessories;
        let btnRender = activeAccessories.map((item, index) => (
            <button key={index} onClick={(e) => this._handleAccessoryPaletteChange(e, item)}>{`Generate new color palette for ${item} accessory`}</button>
        ));
        return btnRender
    }

    render () {
        return (
            <div>
                <button onClick={(e) => this._generateKat(e)}>Generate Kat</button>
                {this._generateCanvas()}
                <br/>
                {this.state.Merged && this.state.ImgData ? <a href={this.state.ImgData} download>Download Kat</a> : null}
                <br />
                <br />
                {this.state.Merged && this.state.ImgData ? this._generatePaletteSwitchBtns() : null}
            </div>
        )
    }
}