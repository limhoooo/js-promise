const Status1 = Object.freeze({
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
});

class _Promise2 {
    constructor(callBack) {
        this.child = null;
        this.state = Status1.PENDING;
        this.fulfilledCallBack = null;
        this.rejectedCallBack = null;
        callBack(
            (v) => this.resolve(v),
            (v) => this.reject(v),
        )
    }

    resolve(value) {
        console.log('resolve');
        this.state = Status1.FULFILLED;
        this.value = value;
        this.fulfilledCallBack && this.fulfilledCallBack(value);
    }
    reject(value) {
        this.state = Status1.REJECTED;
        this.value = value;
    }

    then(callBack, num) {
        console.log(num);
        return new _Promise2((resolve, reject) => {
            // 비동기적
            if (this.state === Status1.PENDING) {
                // 프로미스로 실행될 콜백 함수를 fulfilledCallBack에 저장해둔다.
                this.fulfilledCallBack = () => {
                    this.CallBackFnc(callBack, resolve)
                }
            }
            // 동기적
            if (this.state === Status1.FULFILLED) {
                this.CallBackFnc(callBack, resolve)
            }
        });
    }
    catch(callback) {
        return new _Promise2((resolve, reject) => {
            if (this.state === 'pending') {
                this.onRejectedCallback = () => {
                    this.CallBackFnc(callBack, resolve)

                };
            } if (this.state === 'rejected') {
                this.CallBackFnc(callBack, resolve)
            }
        });
    }
    CallBackFnc(callBack, resolve, reject) {
        const result = callBack(this.value);
        // callBack 에서 실행된 값이 _Promise2 일때
        // 비동기 _Promise2 가 리턴될때
        if (result instanceof _Promise2) {
            result.then(resolve, '3');
        } else {
            resolve(result);
        }
    }

}



// 체인을 걸기위해선 then 에서도 프로미스 리턴을 받아야함

   // .then(() => wait('B'))
//     .finally(() => { console.log('ss') })


