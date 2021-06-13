import React from 'react';
import {getAccessory, getKatData, getPalette} from '../util/dao';
import {applyColorPalette, getBackgroundColorMap, redrawFromMatrix, mergeLayers, convertCoordToObj} from '../util/generator-helper';
import _ from 'lodash';

export class Generator extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            Face: {},
            Accessories: {},
            Background: {},
            Merged: null,
            ImgData: null,
            ActiveAccessories: [],
            TopCoord: [],
            MidCoord: [],
            BottomCoord: [],
            FaceCoord: [],
            BackgroundCoord: []
        }
    }
    _getAccessoryCoordinatFromState(placement) {
        switch (placement) {
            case "top":
                return this.state.TopCoord
            case "mid":
                return this.state.MidCoord
            case "bottom":
                return this.state.BottomCoord
            default:
                break;
        }
    }

    _getAccessory(placement) {
        let data = getAccessory(placement)
            data.then(r => {
                let activeAcc = _.cloneDeep(this.state.ActiveAccessories)
                let accClone = _.cloneDeep(this.state.Accessories);
                let newAccCoord = applyColorPalette(r["accessory"]["accessory"], accClone[placement]["palette"]["palette"]);
                accClone[placement]["accessory"]["accessory"] = convertCoordToObj(newAccCoord);
                let activeGroup = []
                activeAcc.forEach(item => {
                    if (item === placement) {
                        let newAccClone = _.cloneDeep(newAccCoord);
                        activeGroup.push(newAccClone);
                    } else {
                        let otherClone = _.cloneDeep(this._getAccessoryCoordinatFromState(item));
                        activeGroup.push(otherClone)
                    }
                })
                this.canvasRef.current.getContext("2d").clearRect(0,0,240,240);
                let faceClone = _.cloneDeep(this.state.FaceCoord);

                let bgClone = _.cloneDeep(this.state.Background);
                let background = getBackgroundColorMap(bgClone["background"]["Background"]);
                const tempWriteBG = _.cloneDeep(background);
                const tempWriteFace = _.cloneDeep(faceClone)
                let base = mergeLayers(tempWriteBG, tempWriteFace);
                let m = mergeLayers(activeGroup[0], activeGroup[1]);
                let t = mergeLayers(base, m);
                redrawFromMatrix(t, this.canvasRef.current.getContext("2d"));
                let imgData = this.canvasRef.current.toDataURL("image/png");
                switch (placement) {
                    case "top":
                        this.setState({
                            TopCoord: newAccCoord,
                            ImgData: imgData,
                            Merged: t,
                            Accessories: accClone
                        });
                        break;
                    case "mid":
                        this.setState({
                            MidCoord: newAccCoord,
                            ImgData: imgData,
                            Merged: t,
                            Accessories: accClone
                        });
                        break;
                    case "bottom":
                        this.setState({
                            BottomCoord: newAccCoord,
                            ImgData: imgData,
                            Merged: t,
                            Accessories: accClone
                        });
                        break;
                    default:
                        break;
                }
            })
    }

    _redrawAccessory (placement) {
        const editCoord = applyColorPalette(this.state.Accessories[placement]["accessory"]["accessory"],this.state.Accessories[placement]["palette"]["palette"]);
        let mc = _.cloneDeep(this.state.Merged);
        let combo = mergeLayers(mc, editCoord);
        redrawFromMatrix(combo, this.canvasRef.current.getContext("2d"));
        let imgData = this.canvasRef.current.toDataURL("image/png");
        this.setState({
            Merged: combo,
            ImgData: imgData
        })
    }

    _drawInitialKat () {
        let faceClone = _.cloneDeep(this.state.Face);
        let bgClone = _.cloneDeep(this.state.Background);
        let accClone = _.cloneDeep(this.state.Accessories);
        let face = applyColorPalette(faceClone["face"]["Face"],faceClone["palette"]["palette"]);
        let background = getBackgroundColorMap(bgClone["background"]["Background"]);
        const tempBg = _.cloneDeep(background);
        const tempFace = _.cloneDeep(face);
        let aGroup = {};
        Object.keys(accClone).forEach(placement => {
            aGroup[placement] = applyColorPalette(accClone[placement]["accessory"]["accessory"], accClone[placement]["palette"]["palette"]);
        });
        let base = mergeLayers(background, face);
        let aGroupClone = _.cloneDeep(aGroup);
        let ags = Object.values(aGroupClone);
        let agk = Object.keys(aGroupClone);
        let agsIndex = Math.floor(Math.random() * ags.length);
        ags.splice(agsIndex, 1); // active accessories: (randomized two chosen)
        agk.splice(agsIndex, 1); // active accessory names: (randomized two chosen)
        let a = ags.reduce((acc, curr) => {
            return mergeLayers(acc, curr);
        });
        let combo = mergeLayers(base, a);
        redrawFromMatrix(combo, this.canvasRef.current.getContext("2d"));

        let imgData = this.canvasRef.current.toDataURL("image/png");
        this.setState({
            ActiveAccessories: agk,
            Merged: combo,
            ImgData: imgData,
            TopCoord: aGroup["top"],
            MidCoord: aGroup["mid"],
            BottomCoord: aGroup["bottom"],
            FaceCoord: tempFace,
            BackgroundCoord: tempBg
        });
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

    _handleAccessoryChange(e, placement) {
        e.preventDefault();
        this._getAccessory(placement)
    }

    _generateBtns () {
        let activeAccessories = this.state.ActiveAccessories;
        let btnRender = activeAccessories.map((item, index) => (
            <button key={index} onClick={(e) => this._handleAccessoryPaletteChange(e, item)}>{`Generate new ${item} accessory palette`}</button>
        ));
        return btnRender
    }

    _generateAccessoryBtns () {
        let activeAccessories = this.state.ActiveAccessories;
        let btnRender = activeAccessories.map((item, index) => (
            <button key={index} onClick={(e) => this._handleAccessoryChange(e, item)}>{`Generate new ${item} accessory`}</button>
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
                {this.state.Merged && this.state.ImgData ? this._generateBtns() : null}
                <br />
                <br />
                {this.state.Merged && this.state.ImgData ? this._generateAccessoryBtns() : null}
            </div>
        )
    }
}