class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    searchTable() {
      const q = this.queryStr.q
        ? {
            name: {
                $regex: this.queryStr.q,
                $options: "i",
            }
          }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchItem() {
      const q = this.queryStr.q
        ? {
            $or : [
                {name: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
                {shortCode: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }}
            ]
          }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchCustomer() {
      const q = this.queryStr.q
        ? {
            $or : [
                {name: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
                {phoneNo: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }}
            ]
          }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchEmployee() {
      const q = this.queryStr.q
        ? {
            $or : [
                {name: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
                {phoneNo: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
                {saleId: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
                {email: {
                    $regex: this.queryStr.q,
                    $options: "i",
                }},
            ]
          }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchOrder() {
      const q = this.queryStr.q
        ? {
          tokenNo: {
              $regex: this.queryStr.q,
              $options: "i",
          }
        }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchInvoice() {
      const q = this.queryStr.q
        ? {
          invoiceNo: {
              $regex: this.queryStr.q,
              $options: "i",
          }
        }
        : {};
        this.query = this.query.find(q);
      return this;
    }

    searchInventory() {
      const q = this.queryStr.q
        ? {
          name: {
              $regex: this.queryStr.q,
              $options: "i",
          }
        }
        : {};
        this.query = this.query.find(q);
      return this;
    }
    
    filter() {
      const queryCopy = { ...this.queryStr };
      
      const removeFields = ["q", "page", "limit"];
      
      removeFields.forEach((key) => delete queryCopy[key]);
      
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
      
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    pagination(resultPerPage) {
      const currentPage = Number(this.queryStr.page) || 1;
  
      const skip = resultPerPage * (currentPage - 1);
  
      this.query = this.query.limit(resultPerPage).skip(skip);
  
      return this;
    }  
}

export { ApiFeatures };
