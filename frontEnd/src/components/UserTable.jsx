import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [editedUsers, setEditedUsers] = useState([]);
  const [selectDelete, setSelectDelete] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState('');
  const autosaveInterval = useRef(null);

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/users')
      .then(response => {
        setUsers(response.data);
        setEditedUsers(response.data.map(user => ({ ...user, hasChanged: false }))); 
        setSelectDelete([]);
      })
      .catch(error => console.error('Gagal mengambil data pengguna', error));
  };

  useEffect(() => {
    fetchUsers();
    
    autosaveInterval.current = setInterval(() => {
      if (hasChanges) {
        handleSave(true); 
      }
    }, 60000); 

    return () => {
      clearInterval(autosaveInterval.current);
    };
  }, [hasChanges]);

  const handleInputChange = (e, id, field) => {
    const newValue = e.target.value;

    setEditedUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, [field]: newValue, hasChanged: true } : user
      )
    );
    setHasChanges(true);
  };

  const handleInputBlur = (id) => {
    const user = editedUsers.find(user => user.id === id && user.hasChanged);
    if (user) {
      setHasChanges(true); 
    }
  };

  const handleAddUser = () => {
    const newUser = { id: null, name: '', position: '', salary: 0 };
    setNewUsers(prevNewUsers => [...prevNewUsers, newUser]);
    setHasChanges(true);
  };

  const handleCheckboxChange = (id) => {
    setSelectDelete((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((userId) => userId !== id)
        : [...prevSelected, id]
    );
    setHasChanges(true);
  };

  const handleSave = (autosave = false) => {
    const changedUsers = editedUsers.filter(user => user.hasChanged);

  
    if (changedUsers.length > 0) {
      axios.put('http://localhost:8080/api/users/batch', changedUsers)
        .then(response => {
          setUsers(response.data);
          setEditedUsers(response.data.map(user => ({ ...user, hasChanged: false }))); 
          if (!autosave) alert('Pengguna berhasil disimpan');
          else setMessage('Perubahan berhasil di-autosave');
        })
        .catch(error => console.error('Terjadi kesalahan saat menyimpan pengguna', error));
    }


    if (newUsers.length > 0) {
      axios.post('http://localhost:8080/api/users/batch', newUsers)
        .then(response => {
          setUsers(prevUsers => [...prevUsers, ...response.data]);
          setNewUsers([]); 
          if (!autosave) alert('Pengguna baru berhasil ditambahkan');
          else setMessage('Pengguna baru berhasil di-autosave');
        })
        .catch(error => console.error('Terjadi kesalahan saat menambahkan pengguna baru', error));
    }

 
    if (selectDelete.length > 0) {
      axios.delete('http://localhost:8080/api/users/batch', { data: selectDelete })
        .then(() => {
          setUsers(prevUsers => prevUsers.filter(user => !selectDelete.includes(user.id)));
          setSelectDelete([]); 
          if (!autosave) alert('Pengguna berhasil dihapus');
          else setMessage('Pengguna berhasil dihapus melalui autosave');
        })
        .catch(error => console.error('Terjadi kesalahan saat menghapus pengguna', error));
    }

    setHasChanges(false); 
  };

  return (
    <div>
      <button onClick={() => handleSave(false)}>Simpan</button>
      <button onClick={handleAddUser}>Tambah Pengguna</button>
      {message && <div>{message}</div>}
      <table>
        <thead>
          <tr>
            <th>Hapus</th>
            <th>ID</th>
            <th>Nama</th>
            <th>Posisi</th>
            <th>Gaji</th>
          </tr>
        </thead>
        <tbody>
          {editedUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectDelete.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => handleInputChange(e, user.id, 'name')}
                  onBlur={() => handleInputBlur(user.id)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={user.position}
                  onChange={(e) => handleInputChange(e, user.id, 'position')}
                  onBlur={() => handleInputBlur(user.id)} 
                />
              </td>
              <td>
                <input
                  type="number"
                  value={user.salary}
                  onChange={(e) => handleInputChange(e, user.id, 'salary')}
                  onBlur={() => handleInputBlur(user.id)} 
                />
              </td>
            </tr>
          ))}
          {newUsers.map((user, index) => (
            <tr key={`new-${index}`}>
              <td></td>
              <td>Isikan</td>
              <td>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setNewUsers(prevNewUsers => {
                      const updatedNewUsers = [...prevNewUsers];
                      updatedNewUsers[index].name = newName;
                      return updatedNewUsers;
                    });
                  }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={user.position}
                  onChange={(e) => {
                    const newPosition = e.target.value;
                    setNewUsers(prevNewUsers => {
                      const updatedNewUsers = [...prevNewUsers];
                      updatedNewUsers[index].position = newPosition;
                      return updatedNewUsers;
                    });
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={user.salary}
                  onChange={(e) => {
                    const newSalary = e.target.value;
                    setNewUsers(prevNewUsers => {
                      const updatedNewUsers = [...prevNewUsers];
                      updatedNewUsers[index].salary = newSalary;
                      return updatedNewUsers;
                    });
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
