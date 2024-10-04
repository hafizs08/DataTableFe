import axios from 'axios';
import React, { useEffect, useState } from 'react';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [editedUsers, setEditedUsers] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/users')
      .then(response => {
        setUsers(response.data);
        setEditedUsers(response.data);
        setSelectedForDeletion([]);
      })
      .catch(error => console.error('Gagal mengambil data pengguna', error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e, id, field) => {
    const newValue = e.target.value;
    setEditedUsers(prevUsers =>
      prevUsers.map(user => user.id === id ? { ...user, [field]: newValue } : user)
    );
  };

  const handleAddUser = () => {
    const newUser = { id: null, name: '', position: '', salary: 0 };
    setNewUsers(prevNewUsers => [...prevNewUsers, newUser]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedForDeletion((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((userId) => userId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSave = () => {
    axios.put('http://localhost:8080/api/users/batch', editedUsers)
      .then(response => {
        setUsers(response.data);
        setEditedUsers(response.data);
        alert('Pengguna berhasil disimpan');
      })
      .catch(error => console.error('Terjadi kesalahan saat menyimpan pengguna', error));

    if (newUsers.length > 0) {
      axios.post('http://localhost:8080/api/users/batch', newUsers)
        .then(response => {
          setUsers(prevUsers => [...prevUsers, ...response.data]); 
          setNewUsers([]);
          alert('Pengguna baru berhasil ditambahkan');
        })
        .catch(error => console.error('Terjadi kesalahan saat menambahkan pengguna baru', error));
    }

    if (selectedForDeletion.length > 0) {
      axios.delete('http://localhost:8080/api/users/batch', { data: selectedForDeletion })
        .then(() => {
          setUsers(prevUsers => prevUsers.filter(user => !selectedForDeletion.includes(user.id)));
          setSelectedForDeletion([]);
          alert('Pengguna berhasil dihapus');
        })
        .catch(error => console.error('Terjadi kesalahan saat menghapus pengguna', error));
    }
    fetchUsers();
  };

  return (
    <div>
      <button onClick={handleSave}>Simpan</button>
      <button onClick={handleAddUser}>Tambah Pengguna</button>
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
                  checked={selectedForDeletion.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => handleInputChange(e, user.id, 'name')}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={user.position}
                  onChange={(e) => handleInputChange(e, user.id, 'position')}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={user.salary}
                  onChange={(e) => handleInputChange(e, user.id, 'salary')}
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
