class ApiResponse<T>{
    success: true;
    data: T;
    error: null;
    constructor(data:T){
        this.success=true;
        this.data=data
        this.error=null
    }
}

export default ApiResponse