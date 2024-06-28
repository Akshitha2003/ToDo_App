import { useEffect, useState } from 'react'
import Styles from './TODO.module.css'
import { dummy } from './dummy'
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo()
            setTodoData(apiData);
            setLoading(false)
        }
        fetchTodo();
    }, [])

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        }
        try {
            const response = await axios.request(options)
            return response.data.map(todo => ({ ...todo, isEditing: false }));
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    }

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDesc
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => [...prevData, { ...response.data.newTodo, ...response.data.newDesc, isEditing: false }]);
                setNewTodo('')
                setNewDesc('')
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.filter(todo => todo._id !== id))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const updateTodo = (id) => {
        const todoToUpdate = todoData.find(todo => todo._id === id)
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                done: !todoToUpdate.done
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.map(todo => todo._id === id ? { ...response.data, isEditing: false } : todo));
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const editTodo = id => {
        setTodoData(prevData => prevData.map(todo => todo._id === id ? { ...todo, isEditing: true } : todo));
    };

    const saveTodo = id => {
        const todoToSave = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: todoToSave.title,
                description: todoToSave.description
            }
        };
        axios
            .request(options)
            .then(response => {
                setTodoData(prevData => prevData.map(todo => todo._id === id ? { ...response.data, isEditing: false, descDisplay: false } : todo));
            })
            .catch(err => {
                console.log(err);
            });
    };

    const handleTitleChange = (id, newTitle) => {
        setTodoData(prevData => prevData.map(todo => todo._id === id ? { ...todo, title: newTitle } : todo));
    };

    const handleDescChange = (id, newDesc) => {
        setTodoData(prevData => prevData.map(todo => todo._id === id ? { ...todo, description: newDesc } : todo));
    };

    const calculateWidth = text => {
        const tempElement = document.createElement('span');
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontSize = '16px';
        tempElement.innerText = text;

        document.body.appendChild(tempElement);
        const width = tempElement.clientWidth;
        document.body.removeChild(tempElement);

        return width + 20;
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>
                    Tasks
                </h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value)
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Desc'
                        value={newDesc}
                        onChange={(event) => {
                            setNewDesc(event.target.value)
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo()
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry, index) => (
                            <div key={entry._id} className={Styles.todo} >
                                <span className={Styles.infoContainer}>
                                    <input
                                        type='checkbox'
                                        style={{marginTop: '5px'}}
                                        checked={entry.done}
                                        onChange={() => {
                                            updateTodo(entry._id);
                                        }}
                                    />
                                    {entry.isEditing ? (
                                        <span>
                                            <input 
                                                className={Styles.editingInput}
                                                type="text"
                                                style={{ width: `${calculateWidth(entry.title)}px` }}
                                                value={entry.title}
                                                onChange={(e) => handleTitleChange(entry._id, e.target.value)}
                                            />
                                            <div>
                                                <input 
                                                    className={Styles.editingInput}
                                                    type="text"
                                                    style={{ marginLeft: '32px', width: `${calculateWidth(entry.description)}px` }}
                                                    value={entry.description}
                                                    onChange={(e) => handleDescChange(entry._id, e.target.value)}
                                                />
                                            </div>
                                        </span>
                                    ) : (
                                        <span  className='displayTodo'>
                                            <span style={{fontSize: 21, marginTop: '10px'}}>{entry.title}</span>
                                            <div>Description: {entry.description}</div>
                                        </span>
                                    )}
                                </span>
                                <span
                                    className={Styles.buttonStyle}
                                    onClick={() => {
                                        entry.isEditing ? saveTodo(entry._id) : editTodo(entry._id);
                                    }}
                                >
                                    {entry.isEditing ? 'Done' : 'Edit'}
                                </span>
                                <span
                                    className={Styles.buttonStyle}
                                    onClick={() => {
                                        deleteTodo(entry._id);
                                    }}
                                >
                                    Delete
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    )
}
