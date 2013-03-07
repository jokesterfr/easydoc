{{#results}}
		<div class="search-result">
			<a href="{{url}}">{{name}}</a>
			{{#hits}}
				<div class="hit">{{val}}</div>
			{{/hits}}
		</li>
{{/results}}
</ul>
{{^results}}
	<div class="no-result">No results found !</div>
{{/results}}
