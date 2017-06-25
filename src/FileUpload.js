import React from 'react';
import PropTypes from 'prop-types';
import Http from './Http';
import SizeInBytesStr from './SizeInBytesStr';
import { Line } from 'rc-progress';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './FileUpload.css';

class FileUpload extends React.Component {

    constructor(props) {
        if (!props.uploadUrl) throw new Error("FileUpload: props.uploadUrl not provided");
        if (!props.removeUrl) throw new Error("FileUpload: props.removeUrl not provided");
        if (!props.parentId) throw new Error("FileUpload: props.parentId not provided");

        super(props);

        this.maxTextLength = 32;
        this.http = new Http();
        this.state = {
            attachments: props.attachments || [],
            maxSize: props.maxSize || 25
        };
    }

    openFileDialog() {
        this.fileDialog.click();
    }

    onError(xhr, status, error) {
        const msg = xhr && xhr.responseText && xhr.responseText.length < 256 ? xhr.responseText : error;
        console.error(msg);
        if (this.props.addNotification)
            this.props.addNotification(msg, true);        
    }

    upload(e) {
        const target = e.target;
        if (!target.files.length)
            return;

        const file = target.files[0];
        if (file.size > (this.state.maxSize << 20)) {
            this.onError(null, null, `File exceeds maximum upload limit of ${this.state.maxSize}MB. Please compress the file to a smaller file size and try again.`);
            return;
        }

        const data = new FormData();
        data.append("parentId", this.props.parentId);
        data.append("file", file);

        const attachment = { Name: file.name, DataLength: file.size, Uploading: true, Progress: 10, Id: 0};
        this.setState({ attachments: [attachment, ... this.state.attachments] });
        const me = this;

        this.http.ajax({
                url:  this.props.uploadUrl,
                type: this.props.method || "POST",
                data: data,
                contentType: false,
                processData: false,
                xhr: function () {
                    const xhr = new window.XMLHttpRequest();
                    xhr.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            const percentComplete = Math.round((evt.loaded * 100) / evt.total);
                            attachment.Progress = percentComplete;
                            me.setState({ attachments: me.state.attachments });
                        }
                    }, false);
                    return xhr;
                }
            })
            .done(ret => {
                const uploaded = this.state.attachments.find(c => c.Id == attachment.Id);
                if (uploaded) {
                    uploaded.Id = ret.Id;
                    uploaded.Progress = 100;
                    uploaded.Uploading = false;
                    this.setState({ attachments: this.state.attachments });
                } else {
                    console.error("could not find attachment with Id", attachment.Id);
                }
            })
            .fail((xhr, status, error) => {
                this.setState({ uploading: false, progress: 100, attachments: this.state.attachments.filter(c => c.Id != attachment.Id) });               
                this.onError(xhr, status, error);
            })
            .always(() => {
                target.value = "";
            });
    }

    remove(id) {
        if (!id)
            return;

        this.http.delete(this.props.removeUrl + "/" + id)
            .done(() => {
                const attachments = this.state.attachments.filter(c => c.Id != id);
                this.setState({ attachments: attachments});
            })
            .fail((xhr, status, error) => {
                this.onError(xhr, status, error);
            });
    }

    render() {

        const attachments = this.state.attachments.map(c => c.Uploading ? <div key={c.Id}>
                <div className="col-md-6 attachment t-margin-sm pad-md">
                    <span className="text-trim">{c.Name}</span>
                    <span className="text-trim"> &#40;{SizeInBytesStr(c.DataLength)}&#41;</span>
                </div>
                <div className="col-md-6 attachment t-margin-sm pad-md">
                    <Line percent={c.Progress} strokeColor="#f4590d" />
                </div>
            </div>
            : 
            <div key={c.Id}>
                <div className="col-md-11 attachment t-margin-sm pad-md">
                    <span className="text-trim">{c.Name}</span>
                    <span className="text-trim"> &#40;{SizeInBytesStr(c.DataLength)}&#41;</span>
                </div>
                <div className="col-md-1 attachment t-margin-sm pad-md">
                    <a className="n-close close pull-right" onClick={() => this.remove(c.Id)}>
                        <span className="ion-close-circled"></span>
                    </a>
                </div>
            </div>);

        return <div className="t-pad-lg">
            {attachments}
            <div className="row">
                <div className="col-xs-12 t-pad-lg">
                    <button type="button" className="btn btn-default" onClick={() => this.openFileDialog()}>
                        <span className="ion-ios-upload"></span> 
                        <span> File Upload</span>
                    </button>
                    <input type="file" className="hide" ref={input => this.fileDialog = input} onChange={e => this.upload(e)} accept={this.props.accept} />
                </div>
            </div>
         </div>;
    }
};

FileUpload.propTypes = {
    parentId: PropTypes.string.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    removeUrl: PropTypes.string.isRequired,
    accept: PropTypes.string,
    attachments: PropTypes.array,
    addNotification: PropTypes.func,
    maxSize: PropTypes.number,
    method: PropTypes.string
};

export default FileUpload;
