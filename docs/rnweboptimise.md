# react native web滚动性能优化

刚开始开发rn web上拉滚动页面的时候，往往会遇到dom增加的时候，页面假死卡顿的情况。

- 列表尽量使用ListView，设置pageSize

- ListView的每个item分离开，不要写在一个模块。每个item都需要设置key。

- 一般外层的ListView才是变化的，里层item尽量不做更新，如果item有更新，则继续分离组件。

- 使用reducer数据双向通信

	- 尽量量少action，可以聚合的action放一起，不然每次dispatch都会把每个reducer跑一遍。combineReducers只是帮忙聚合每个reducer，并不能减少触发每个action的调用。

	- 组件状态尽量通过state设置，跨组件的状态再用reducer connnet出来。因为每次reducer的执行都是开销。

	- 有用到reducer控制状态的组件，在shouldComponentUpdate判断下是否要执行render。不需要render的return false

- ListView的常用设置

```jsx
	<ListView contentContainerStyle={[styles.contain]} 
		dataSource={this.state.dataSource}
		renderRow={this.renderRow}
		pageSize={20}
		initialListSize={20}
		onEndReached={()=>{this.onScrollEnd()}}
		onEndReachedThreshold={300}
	>
```