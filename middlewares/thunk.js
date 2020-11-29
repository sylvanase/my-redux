/*
 * @Author: sylvanas
 * @Date: 2020-11-29 20:19:38
 * @LastEditors: sylvanas
 * @LastEditTime: 2020-11-29 20:20:27
 * @Description:
 */
function thunk(store) {
	return function (next) {
		return function (action) {
			console.log('thunk')
			next(action)
		}
	}
}
