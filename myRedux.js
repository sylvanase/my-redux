/**
 * createStore(reducer, preloadedState, enhancer)
 * {getState, dispatch, subscribe}
 */
function createStore(reducer, preloadedState, enhancer) {
	// 约束 reducer 参数类型
	if (typeof reducer !== 'function') {
		throw new Error('reducer 必须是函数')
	}

	// 判断 enhancer是否传递
	if (typeof enhancer !== 'undefined') {
		// enhancer是否为函数
		if (typeof enhancer !== 'function') {
			throw new Error('enhancer 必须是函数')
		}
		return enhancer(createStore)(reducer, preloadedState)
	}

	// store 对象中存储的状态
	var currentState = preloadedState
	// 存放订阅者
	var currentListeners = []

	// 获取状态，利用闭包使 currentState 不会被释放
	function getState() {
		return currentState
	}

	// 触发action
	function dispatch(action) {
		// 判断action 是否是对象
		if (!isPlainObject(action)) throw new Error('action必须是一个对象')
		// 对象中是否有type属性
		if (typeof action.type === 'undefined')
			throw new Error('action 对象中必须要有type属性')
		currentState = reducer(currentState, action)
		// 循环数组，调用订阅者
		for (let i = 0; i < currentListeners.length; i++) {
			// 获取订阅者
			const listener = currentListeners[i]
			// 调用订阅者
			listener()
		}
	}

	// 订阅状态 subscribe，可被订阅多个
	function subscribe(listener) {
		currentListeners.push(listener)
	}

	return {
		getState,
		dispatch,
		subscribe,
	}
}

// 判断是否为对象
function isPlainObject(obj) {
	// 排除基本数据类型及null
	if (typeof obj !== 'object' || obj === null) return false
	// 区分数组和对象 原型对象对比的方式
	var proto = obj
	while (Object.getPrototypeOf(proto) != null) {
		proto = Object.getPrototypeOf(proto)
	}
	return Object.getPrototypeOf(obj) == proto
}

function applyMiddleware(...middlewares) {
	return function (createStore) {
		return function (reducer, preloadedState) {
			// 创建 store
			var store = createStore(reducer, preloadedState)
			// 阉割版的 store
			var middlewareAPI = {
				getState: store.getState,
				dispatch: store.dispatch,
			}
			// 调用中间件的第一层函数 传递阉割版的store对象
			var chain = middlewares.map((middleware) => middleware(middlewareAPI))
			var dispatch = compose(...chain)(store.dispatch)
			return {
				...store,
				dispatch,
			}
		}
	}
}

function compose() {
	var funcs = [...arguments]
	return function (dispatch) {
		for (var i = funcs.length - 1; i >= 0; i--) {
			dispatch = funcs[i](dispatch)
		}
		return dispatch
	}
}

function bindActionCreators(actionCreators, dispatch) {
	var boundActionCreators = {}
	for (const key in actionCreators) {
		boundActionCreators[key] = function () {
			dispatch(actionCreators[key]())
		}

		// (function (key) {
		//   boundActionCreators[key] = function () {
		//     dispatch(actionCreators[key]())
		//   }
		// })(key)
	}

	return boundActionCreators
}

function combineReducers(reducers) {
	// 1. 检查reducer类型 它必须是函数
	var reducerKeys = Object.keys(reducers)
	for (var i = 0; i < reducerKeys.length; i++) {
		var key = reducerKeys[i]
		if (typeof reducers[key] !== 'function')
			throw new Error('reducer必须是函数')
	}
	// 2. 调用一个一个的小的reducer 将每一个小的reducer中返回的状态存储在一个新的大的对象中
	return function (state, action) {
		var nextState = {}
		for (var i = 0; i < reducerKeys.length; i++) {
			var key = reducerKeys[i]
			var reducer = reducers[key]
			var previousStateForKey = state[key]
			nextState[key] = reducer(previousStateForKey, action)
		}
		return nextState
	}
}
