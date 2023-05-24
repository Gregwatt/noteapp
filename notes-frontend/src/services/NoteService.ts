import http from "../http-common";

// Service details from https://www.bezkoder.com/react-hooks-crud-axios-api/

const getAll = () => {
    return http.get(`/note`);
};

const get = (id: string) => {
    return http.get(`/note/${id}`);
};

const create = (data: any) => {
    return http.post("/note", data);
}

const update = (id: string, data: any) => {
    return http.put(`/note/${id}`, data);
}

const remove = (id: string) => {
    return http.delete(`/note/${id}`);
}

const NoteService = {
    getAll,
    get,
    create,
    update,
    remove
}

export default NoteService;