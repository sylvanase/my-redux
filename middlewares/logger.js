/*
 * @Author: sylvanas
 * @Date: 2020-11-29 20:19:33
 * @LastEditors: sylvanas
 * @LastEditTime: 2020-11-29 20:20:14
 * @Description:
 */

function logger(store) {
	return function (next) {
		return function (action) {
			console.log('logger')
			next(action)
		}
	}
}
