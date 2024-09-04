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

    searchBook() {
      const keyword = this.queryStr.keyword
        ? {
            $or : [
                {ISBN: {
                    $regex: this.queryStr.keyword,
                    $options: "i",
                }},
                {title: {
                    $regex: this.queryStr.keyword,
                    $options: "i",
                }},
                {author: {
                    $regex: this.queryStr.keyword,
                    $options: "i",
                }}
            ]
          }
        : {};
        this.query = this.query.find(keyword);
      return this;
    }
    
    filter() {
      const queryCopy = { ...this.queryStr };

      const removeFields = ["q", "page", "limit"];
  
      removeFields.forEach((key) => delete queryCopy[key]);

      this.query = this.query.find(queryCopy);
  
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