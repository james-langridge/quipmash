import React, { useState, useEffect } from "react";
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Container from 'react-bootstrap/Container';
import { useSelector } from 'react-redux';
import Dashboard from "./Dashboard";
import Button from 'react-bootstrap/Button';
import { socket } from '../sockets';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import QuestionForm from './QuestionForm';
import ImageForm from './ImageForm';

const Admin = (props) => {
  const userId = useSelector(state => state.auth.user.id);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const username = useSelector(state => state.auth.user.name);
  const [errorMsg, setErrorMsg] = useState('');
  const [questionList, setQuestionList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [tableDataLoaded, setTableDataLoaded] = useState(false);
  const [view, setView] = useState('question');
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState({})

  useEffect(() => {
    socket.auth = { username };
    socket.username = username;
    socket.connect();
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('tableData:', tableData);
    setTableDataLoaded(true);
  }, [tableData]);

  const getQuestionList = async () => {
    try {
      const { data } = await axios.get(`prompt/getAllPrompts/${userId}`);
      setErrorMsg('');
      setQuestionList(data);
    } catch (error) {
      console.log('error:', error)
      // error.response && setErrorMsg(error.response.data);
    }
  };

  useEffect(() => {
    getQuestionList();
  }, []);

  useEffect(() => {
    console.log('questionList:', questionList);
    const questions = [];
    for (const question of questionList) {
      const obj = {};
      obj.id = question._id;
      obj.main = question.question;
      questions.push(obj);
    }
    setTableData({
      data: questions,
      columns: [
        {
          dataField: 'id',
          hidden: true
        },
        {
          dataField: 'main',
          text: 'Question',
          sort: true,
        }
      ],
        defaultSorted: [{
          dataField: 'question',
          order: 'desc'
        }]
    });
  }, [questionList]);

  useEffect(() => {
    console.log('fileList:', fileList);
    const pictures = [];
    for (const picture of fileList) {
      const obj = {};
      obj.id = picture._id;
      obj.description = picture.description;
      obj.main = picture.file_url;
      pictures.push(obj);
    }
    setTableData({
      data: pictures,
      columns: [
        {
          dataField: 'id',
          hidden: true
        },
        {
          dataField: 'description',
          text: 'Description',
          sort: true,
        }
        ,
        {
          dataField: 'main',
          hidden: true
        }
      ],
        defaultSorted: [{
          dataField: 'description',
          order: 'desc'
        }]
    });
  }, [fileList]);

  useEffect(() => {
    console.log('data:', data)
  }, [data]);

  const getPictureList = async () => {
    try {
      const { data } = await axios.get(`file/getAllFiles/${userId}`);
      setErrorMsg('');
      setFileList(data);
    } catch (error) {
      console.log('error:', error)
      // error.response && setErrorMsg(error.response.data);
    }
  };

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    onSelect: (row, isSelect) => {
      let newState = [...selected];
      if (isSelect) {
        const obj = {};
        obj._id = row.id;
        obj.question = row.main;
        newState.push(obj);
      } else if (!isSelect) {
        const index = newState.findIndex((item => item._id === row.id));
        newState.splice(index, 1);
      }
      setSelected(newState);
    },
    onSelectAll: (isSelect, rows) => {
      let newState = [];
      if (isSelect) {
        for (const row of rows) {
          const obj = {};
          obj._id = row.id;
          obj.question = row.main;
          newState.push(obj);
        }
      }
      setSelected(newState);
    }
  };

  useEffect(() => {
    console.log('selected:', selected)
  }, [selected]);

  useEffect(() => {
    console.log('view:', view)
  }, [view]);

  const handleClick = (view) => {
    setView(view);
    switch (view) {
      case 'question':
        getQuestionList()
        break;
      case 'picture':
        getPictureList();
        break;
    }
  }

  const handleDelete = async () => {
    const result = window.confirm('Delete? You cannot undo this.')
    if (result) {
      try {
        await axios.delete(`prompt/delete`, {
          data: {
            selected
          }
        });
        setErrorMsg('');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrorMsg('Error while deleting file.  Try again later.');
        }
      }
      getPictureList();
    }
  };

  return (
    <Container>
      {view === 'question' &&
        <QuestionForm
          functions={[errorMsg, setErrorMsg, getPictureList]}
          userId={userId}
        />
      }
      {view === 'picture' &&
        <ImageForm
          functions={[errorMsg, setErrorMsg, getQuestionList]}
          userId={userId}
        />
      }
      <Dashboard selected={selected} />
      {tableDataLoaded &&
        <>
          <ButtonGroup size="sm">
            <Button
              variant="outline-secondary"
              onClick={() => handleClick('question')}
            >
              Questions
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handleClick('picture')}
            >
              Pictures
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => handleDelete()}
              disabled={selected.length<1}
            >
              Delete
            </Button>
          </ButtonGroup>
          <BootstrapTable
            bootstrap4
            keyField='id'
            data={ tableData.data }
            columns={ tableData.columns }
            selectRow={ selectRow }
            striped
            hover
            noDataIndication="Table is Empty"
            defaultSorted={ tableData.defaultSorted }
            cellEdit={ cellEditFactory({
              mode: 'click',
              beforeSaveCell: (oldValue, newValue, row, column) => {
                 console.log('Before Saving Cell!!');
               }
            }) }
          />
        </>
      }
    </Container>
  );
}

export default Admin;

//
// validator: (newValue, row, column, done) => {
//   setTimeout(() => {
//     if (isNaN(newValue)) {
//       return done({
//         valid: false,
//         message: 'Price should be numeric'
//       });
//     }
//     if (newValue < 2000) {
//       return done({
//         valid: false,
//         message: 'Price should bigger than 2000'
//       });
//     }
//     return done();
//   }, 2000);
//   return {
//     async: true
//   };
// }
