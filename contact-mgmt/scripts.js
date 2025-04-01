document.addEventListener('DOMContentLoaded', () => {
    const contactList = document.getElementById('contactList');
    const contactForm = document.getElementById('contactForm');
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    const modalTitle = document.getElementById('contactModalLabel');

    // API endpoint (dùng ngrok URL khi test)
    const API_URL = 'https://4fb8-14-242-184-8.ngrok-free.app/api/call'; // Thay bằng ngrok URL sau

    // Hiển thị danh sách contact
    async function fetchContacts() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'crm.contact.list', payload: {} })
            });
            const data = await response.json();
            renderContacts(data.result || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            contactList.innerHTML = '<tr><td colspan="7">Lỗi khi tải danh sách</td></tr>';
        }
    }

    // Render danh sách contact
    function renderContacts(contacts) {
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${contact.NAME || ''} ${contact.LAST_NAME || ''}</td>
                <td>${contact.ADDRESS || ''}, ${contact.ADDRESS_CITY || ''}, ${contact.ADDRESS_PROVINCE || ''}</td>
                <td>${contact.PHONE?.[0]?.VALUE || 'N/A'}</td>
                <td>${contact.EMAIL?.[0]?.VALUE || 'N/A'}</td>
                <td>${contact.WEB?.[0]?.VALUE || 'N/A'}</td>
                <td>${contact.BANKING_DETAILS || 'N/A'}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${contact.ID}">Sửa</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${contact.ID}">Xóa</button>
                </td>
            `;
            contactList.appendChild(tr);
        });

        // Gắn sự kiện cho nút sửa/xóa
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editContact(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteContact(btn.dataset.id));
        });
    }

    // Thêm hoặc sửa contact
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('contactId').value;
        const contactData = {
            NAME: document.getElementById('name').value,
            ADDRESS: document.getElementById('addressWard').value,
            ADDRESS_CITY: document.getElementById('addressDistrict').value,
            ADDRESS_PROVINCE: document.getElementById('addressProvince').value,
            PHONE: [{ VALUE: document.getElementById('phone').value, VALUE_TYPE: 'WORK' }],
            EMAIL: [{ VALUE: document.getElementById('email').value, VALUE_TYPE: 'WORK' }],
            WEB: [{ VALUE: document.getElementById('website').value, VALUE_TYPE: 'WORK' }],
            BANKING_DETAILS: `${document.getElementById('bankName').value} - ${document.getElementById('bankAccount').value}`
        };

        try {
            const action = id ? 'crm.contact.update' : 'crm.contact.add';
            const payload = id ? { ID: id, fields: contactData } : { fields: contactData };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });
            await response.json();
            fetchContacts();
            modal.hide();
            contactForm.reset();
            document.getElementById('contactId').value = '';
            modalTitle.textContent = 'Thêm Contact';
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    });

    // Sửa contact
    async function editContact(id) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'crm.contact.get', payload: { ID: id } })
            });
            const data = await response.json();
            const contact = data.result;
            document.getElementById('contactId').value = contact.ID;
            document.getElementById('name').value = `${contact.NAME || ''} ${contact.LAST_NAME || ''}`;
            document.getElementById('addressWard').value = contact.ADDRESS || '';
            document.getElementById('addressDistrict').value = contact.ADDRESS_CITY || '';
            document.getElementById('addressProvince').value = contact.ADDRESS_PROVINCE || '';
            document.getElementById('phone').value = contact.PHONE?.[0]?.VALUE || '';
            document.getElementById('email').value = contact.EMAIL?.[0]?.VALUE || '';
            document.getElementById('website').value = contact.WEB?.[0]?.VALUE || '';
            const [bankName, bankAccount] = (contact.BANKING_DETAILS || '').split(' - ');
            document.getElementById('bankName').value = bankName || '';
            document.getElementById('bankAccount').value = bankAccount || '';
            modalTitle.textContent = 'Sửa Contact';
            modal.show();
        } catch (error) {
            console.error('Error fetching contact:', error);
        }
    }

    // Xóa contact
    async function deleteContact(id) {
        if (confirm('Bạn có chắc muốn xóa contact này?')) {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'crm.contact.delete', payload: { ID: id } })
                });
                fetchContacts();
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    }

    // Khởi động
    fetchContacts();
});