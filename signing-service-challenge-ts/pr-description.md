### scope 🚀🚀

- support concurrect data access with [async-mutex](https://www.npmjs.com/package/async-mutex)
- followed the open-closed design principle to allow easy extension to other algorithms
- used respository pattern for encapsulating all data persistance logic in a separate layer so it would be easier to swap the data store

### out of scope

Below is a list of things I didn't implement but that should be done if this was a "real" PR

- request payload validation
- there are only some basic unit tests for the sevice layer. We're missing proper integration tests
- the data are persisted in a json file, no proper relational data store was added

### how to test 🦄🦄

- start the signing service
- add a new device

```c
curl -d '{"id":"f196f90b-2a18-40f4-8e8d-1e1cede05a74", "algorithm":"RSA", "label":"tomasz device"
}' -H "Content-Type: application/json" -X POST http://localhost:3000/api/device
```

- create signature

```c
curl -d '{"deviceId":"f196f90b-2a18-40f4-8e8d-1e1cede05a74", "data":"tomasz device"
}' -H "Content-Type: application/json" -X POST http://localhost:3000/api/sign
```

- list the devices

  http://localhost:3000/api/devices

### unit tests

```
npm run test
```
