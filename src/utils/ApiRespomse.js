class ApiResponse extends response {
    constructor(
        statusCode ,data,message ="success"
    ){
        this.statuscode = statusCode,
        this.data = data,
        this.message = message
        }
}