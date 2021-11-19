const Status = Object.freeze({
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
});

class _Promise {
    constructor(callback) {
        this.value = null;
        this.state = Status.PENDING;
        this.child = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        this.onFinallyCallbacks = [];

        callback &&
            callback(
                (v) => this.resolve(v),
                (v) => this.reject(v)
            );
    }

    all(iterable) {
        // 예외처리
        if (!iterable || iterable.length === 0) return this.resolve([]);
        return new _Promise((resolve, reject) => {

            const result = iterable.map(() => ({ state: Status.PENDING, value: undefined }));

            iterable.forEach((iter, idx) => {
                // 프로미스가 아닐시
                if (iter instanceof _Promise === false) {
                    result[idx] = { state: Status.FULFILLED, value: iter };
                    const isDone = !result.some(v => v.state === Status.PENDING);
                    if (isDone) resolve(result.map(v => v.value));
                    return;
                }

                iter.then(value => {
                    result[idx] = { state: Status.FULFILLED, value };
                    const isDone = !result.some(v => v.state === Status.PENDING);
                    if (isDone) resolve(result.map(v => v.value));
                }).catch(err => {
                    reject(err)
                });
            });
        });
    }
    allSettled() {

    }
    any() {

    }
    race() {

    }

    resolve(value) {
        // state 가 pending 일때
        if (this.state === Status.PENDING) {
            // state = FULFILLED 로 변경
            this.state = Status.FULFILLED;
            this.value = value;
            // onFinallyCallbacks 에 들어있는 callback들 함수 실행
            this.onFinallyCallbacks.forEach((callback) => callback());
            if (this.onFulfilledCallbacks.length !== 0) {
                this.onFulfilledCallbacks.forEach((callback) => callback(value));
            } else {
                this.child &&
                    this.child.resolve(value);
            }
        }
    };
    reject(value) {
        if (this.state === Status.PENDING) {
            this.state = Status.REJECTED;
            this.value = value;
            this.onFinallyCallbacks.forEach((callback) => callback());
            if (this.onRejectedCallbacks.length !== 0) {
                this.onRejectedCallbacks.forEach((callback) => callback(value));
            } else {
                this.child &&
                    this.child.resolve(value);
            }
        }
    };
    then(callback) {
        this.child = new _Promise((resolve, reject) => {
            if (this.state === Status.PENDING) {
                // 받아온 callback 함수 push
                this.onFulfilledCallbacks.push(() => {
                    this.handleCallback(callback, resolve, reject);
                });
            }
            if (this.state === Status.FULFILLED) {
                this.handleCallback(callback, resolve, reject);
            }
            if (this.state === Status.REJECTED) {
                reject(this.value);
            }
        });
        return this.child;
    }
    catch(callback) {
        this.child = new _Promise((resolve, reject) => {
            if (this.state === Status.PENDING) {
                this.onRejectedCallbacks.push(() => {
                    this.handleCallback(callback, resolve, reject);
                });
            }
            if (this.state === Status.REJECTED) {
                this.handleCallback(callback, resolve, reject);
            }
            if (this.state === Status.FULFILLED) {
                resolve(this.value);
            }
        });
        return this.child;
    }

    finally(callback) {
        this.child = new _Promise((resolve, reject) => {
            if (this.state === Status.PENDING) {
                this.onFinallyCallbacks.push(() => {
                    this.handleCallback(callback, resolve, reject);
                });
            }
            if (this.state === Status.FULFILLED || this.state === Status.REJECTED) {
                this.handleCallback(callback, resolve, reject);
            }
        });
        return this.child;
    }

    handleCallback(callback, resolve, reject) {
        try {
            const result = callback(this.value);
            if (result instanceof _Promise) {
                if (result.state === Status.FULFILLED) {
                    result.then(resolve);
                }
                if (result.state === Status.REJECTED) {
                    result.catch(reject);
                }
                if (result.state === Status.PENDING) {
                    result.onFulfilledCallbacks.push(() => result.then(resolve));
                    result.onRejectedCallbacks.push(() => result.catch(reject));
                }
            } else {
                resolve(result);
            }
        } catch (error) {
            reject(error);
        }
    }
}

/**
 * TEST CASE
 *
 */

function a(msg) {
    return new _Promise((res, rej) => {
        setTimeout(() => {
            res(msg)
        }, 500);
    })
}

a('a')
    .then(res => { console.log(res); return a('b') })
    .then(res => { console.log(res); return a('c') })
    .then(console.log)


const test = new _Promise();
test.all(['hi', a('3'), a('2')])
    .then(values => console.log(values))

