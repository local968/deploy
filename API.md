# Introduction
What does our API do?

The API serves as an http interface of pre-trained models for user to make predictions. After models are successfully trained, user can consider these model as APIs and make predictions by calling them.   



# Request
* URL: /api/deploy
* HTTP Method: POST (x-www-form-urlencoded)
* Data parameters:
  1. deploymentId
	2. token
	3. data(JSON string)

Deployment page will provide `deploymentId` and `token` parameter

# Response
## Parameters:   
1. result: predict result
2. code: error code, 10000 if success
3. message: humen readable information
4. error: original error information, this field only exist if some error appear

## Response Sample:
```
{
    "result":[
      {
            "age":"300.0",
            "job":"unemployed",
            "marital":"married",
            "education":"primary",
            "default":"no",
            "balance":"1787",
            "housing":"no",
            "loan":"no",
            "contact":"cellular",
            "day":"19",
            "month":"oct",
            "duration":"79",
            "campaign":"1",
            "pdays":"100",
            "previous":"3",
            "poutcome":"unknown",
            "y":"no",
            "y_predict":"0",
            "y_probability_1":"0.013476189619787587"
        },
    ],
    "code":10000,
    "message":"ok"
}

```

# Authentication


For each API call, we use an auto-generated token for the authentication. For each deployment of each project a unique token is generated. After an API call using the token corresponding usage will be counted .

# Error Codes
* 10001: 'deployment not found',
* 10002: 'data not found',
* 10003: 'token not found',
* 10004: 'data is not a valid JSON string',
* 10005: 'data is empty or not a valid array',
* 10006: 'file upload error',
* 10007: 'file upload failed',
* 10008: 'predict error',
* 10009: 'predict failed',
* 10010: 'invalid token',
* 10011: 'exceed prediction usage limit',
* 10012: 'exceed prediction api limit',
* 10013: 'download predict result failed',
* 10014: 'predict result is empty'

# Rate limit
As different limitations are applied to accounts of different levels, when the number/concurency of API calls of user has reached the max allowed amount, subsequent requests will be placed into a request queue as a waiting list. A time-out may be caused if this queue is too long.
