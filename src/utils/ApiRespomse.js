class ApiResponse extends Response {
    constructor(
        statusCode, 
        data, 
        message = "success"
    ) {
        super(message)
        this.statuscode = statusCode,
            this.data = data,
            this.message = message
    }
}



export { ApiResponse }