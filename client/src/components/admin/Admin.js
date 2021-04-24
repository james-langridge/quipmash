import React, { useState, useEffect } from "react";
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Container from 'react-bootstrap/Container';
import { useSelector } from 'react-redux';
import Dashboard from "./Dashboard";
import Button from 'react-bootstrap/Button';
import { socket } from '../../sockets';
import QuestionForm from './QuestionForm';

const Admin = (props) => {
  const userId = useSelector(state => state.auth.user.id);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const username = useSelector(state => state.auth.user.name);
  const [errorMsg, setErrorMsg] = useState('');
  const [questionList, setQuestionList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [gameItems, setGameItems] = useState([]);
  const [tableDataLoaded, setTableDataLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState({})

  useEffect(() => {
    socket.auth = { username };
    socket.username = username;
    socket.connect();
  }, [isAuthenticated]);

  useEffect(() => {
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

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    selected: selected,
    onSelect: (row, isSelect) => {
      if (isSelect) {
        setSelected([...selected, row.id])
        setGameItems([...gameItems, questionList.find(x => x._id === row.id).question])
      } else if (!isSelect) {
        setSelected(selected.filter(x => x !== row.id))
        setGameItems(gameItems.filter(x => x !== row.main))
      }
    },
    onSelectAll: (isSelect, rows) => {
      const ids = rows.map(r => r.id);
      const questions = rows.map(r => r.main);
      if (isSelect) {
        setSelected(ids);
        setGameItems(questions);
      } else {
        setSelected([]);
        setGameItems([]);
      }
    }
  };

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
      getQuestionList()
    }
  };

  return (
    <Container>
      <QuestionForm
        functions={[errorMsg, setErrorMsg, getQuestionList]}
        userId={userId}
      />
      <Dashboard
        selected={gameItems}
        functions={[setSelected, setGameItems]}
      />
      {tableDataLoaded &&
        <>
          <Button
            variant="outline-danger"
            onClick={() => handleDelete()}
            disabled={selected.length<1}
          >
            Delete
          </Button>
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
