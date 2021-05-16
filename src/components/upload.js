import React from "react";
import {findPosition, rgbToHex, recordMappingMatrix} from "../util/accessory-helpers";
import {postAccessoryData} from "../util/dao";

export class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.imgRef = React.createRef();
        this.state = {file: '', imagePreviewUrl: '', colorMap: {}, placement: '', subType: ''};
    }

    componentDidMount() {
        const img = this.imgRef;
    }

    _generateCanvas() {
        return (
            <div>
                <canvas
                    onMouseMove={(e) => this._handleFindPosition(e)}
                    ref={this.canvasRef} width={240} height={240} />
            </div>
        )
    }

    _scanCanvas() {
        let canvas = this.canvasRef;
        let mapping = {}
        const matrix = recordMappingMatrix(canvas.current);
        matrix.forEach((row, index) => {
            mapping[index] = row;
        })
        this.setState({
            colorMap: mapping
        });
        console.log(mapping);
    }

    _saveAccessory() {
        if (this.state.placement !== "" && this.state.subtype !== "" && this.state.colorMap !== {}) {
            postAccessoryData(this.state.placement, this.state.subType, this.state.colorMap)
        } else {
            alert("unable to save accessory plz review configuration");
        }

    }



    _handlePlacementChange(e) {
        this.setState({
            placement: e.target.value
        })
    }

    _handleSubTypeChange(e) {
        this.setState({
            subType: e.target.value,
        })
    }

    _handleSubmit(e) {
        e.preventDefault();
        // TODO: do something with -> this.state.file
        console.log('handle uploading-', this.state.file);
    }

    _handleFindPosition(e) {
        let canvas = this.canvasRef;
        let ctx = canvas.current.getContext("2d");
        var pos = findPosition(canvas.current);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var p = ctx.getImageData(x, y, 10, 10).data;
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        console.log(hex);
    }

    _handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];
        reader.onloadstart = (e) => {
            let ctx = this.canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0,240, 240);
        }
        reader.onloadend = (e) => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result,
                colorMap: {},
                placement: "",
                subType: "",
            });

            let i = new Image();
            i.onload = (e) => {
                let ctx = this.canvasRef.current.getContext("2d");

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 240, 240);
                ctx.drawImage(i, 0, 0, 240,240);
            }
            i.src = this.state.imagePreviewUrl;
        }

        reader.readAsDataURL(file)
    }

    render() {
        let {imagePreviewUrl} = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl) {

            return (
                <div className="previewComponent">
                    <form onSubmit={(e) => this._handleSubmit(e)}>
                        <input className="fileInput"
                               type="file"
                               onChange={(e) => this._handleImageChange(e)}/>
                    </form>
                    <div className="imgPreview">
                        <img ref={this.imgRef} height={240} width={240} alt={"img"} src={imagePreviewUrl}/>
                    </div>
                    <br/>
                    <h4>Canvas</h4>
                    {this._generateCanvas()}
                    <br/>
                    <button onClick={() => this._scanCanvas()}>scan</button>
                    <br />
                    <form id="save-accessory">
                        <label>enter subtype</label>
                        <input className={"subtype-input"} type={"text"} value={this.state.subType} onChange={(e) => this._handleSubTypeChange(e)} />
                        <br />
                        <label>choose placement</label>
                        <select value={this.state.placement} onChange={(e) => this._handlePlacementChange(e)}>
                            <option value="">Select your option</option>
                            {
                                ["top", "mid", "bottom", "custom"].map((el, i) => {
                                    return (<option value={el} key={`${i}_option`}>{el}</option>)
                                })
                            }
                        </select>
                    </form>
                    <button onClick={(e) => this._saveAccessory(e)} >Save Accessory</button>
                </div>
            );
        } else {
            $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
            return (
                <div className="previewComponent">
                    <form onSubmit={(e) => this._handleSubmit(e)}>
                        <input className="fileInput"
                               type="file"
                               onChange={(e) => this._handleImageChange(e)}/>
                    </form>
                    <div className="imgPreview">
                        {$imagePreview}
                    </div>
                    <h4>Canvas</h4>
                    {this._generateCanvas()}
                </div>
            );
        }
    }
}
