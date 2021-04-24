import React, { useState, useRef } from "react";
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const ImageForm = (props) => {
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const dropRef = useRef();
  const [errorMsg, setErrorMsg, getPictureList] = props.functions;
  const [description, setDescription] = useState('');

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const updateBorder = (dragState) => {
    if (dragState === 'over') {
      dropRef.current.style.border = '2px solid #000';
    } else if (dragState === 'leave') {
      dropRef.current.style.border = '2px dashed #e9ebeb';
    }
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile(uploadedFile);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
    };
    fileReader.readAsDataURL(uploadedFile);
    setIsPreviewAvailable(uploadedFile.name.match(/\.(jpeg|jpg|png)$/));
    dropRef.current.style.border = '2px dashed #e9ebeb';
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    try {
      if (description.trim() !== '') {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('description', description);
          formData.append('userId', props.userId);
          setErrorMsg('');
          await axios.post('file/save', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setDescription('');
          getPictureList()
        } else {
          setErrorMsg('Please select a file to add.');
        }
      } else {
        setErrorMsg('Please enter a description.');
      }
    } catch (error) {
      error.response && setErrorMsg(error.response.data);
    }
  };

  return (
    <Form className="form-upload" onSubmit={handleImageSubmit}>
      {errorMsg && <p className="errorMsg">{errorMsg}</p>}
      <Row>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              name="description"
              value={description}
              placeholder="Enter image description..."
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Form.Control
              type="hidden"
              name="userId"
              value={props.userId}
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="upload-section">
        <Dropzone
          onDrop={onDrop}
          onDragEnter={() => updateBorder('over')}
          onDragLeave={() => updateBorder('leave')}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: 'drop-zone' })} ref={dropRef}>
              <input {...getInputProps()} />
              <p>Drag and drop a file OR click here to select a file</p>
              {file && (
                <div>
                  <strong>Selected file:</strong> {file.name}
                </div>
              )}
            </div>
          )}
        </Dropzone>
        {previewSrc ? (
          isPreviewAvailable ? (
            <div className="image-preview">
              <img className="preview-image" src={previewSrc} alt="Preview" />
            </div>
          ) : (
            <div className="preview-message">
              <p>No preview available for this file</p>
            </div>
          )
        ) : (
          <div className="preview-message">
            <p>Image preview will be shown here after selection</p>
          </div>
        )}
      </div>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  );
}

export default ImageForm;
