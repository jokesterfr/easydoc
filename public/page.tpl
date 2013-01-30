<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
        <title>{{title}}</title>
        <link type="text/css" href="public/styles/main.css" rel="stylesheet">
        <script src="public/scripts/main.js"></script>
        <script src="public/scripts/socket.io.js"></script>
        <script src="public/scripts/handlebars.js"></script>
	</head>
	<body class="page">
		<header>
			<form class="search" method="post" action="search">
				<input type="search" name="searched" placeHolder="quicksearch..."/>
				<button>
					<img src="public/img/search.png"/>
				</button>
			</form>
        </header>
       	<div class="main-title">Your product {{title}}</div>
        <nav id="summary-tree"></nav>
        <div class="main">
        	{{{content}}}
        </div>
	</body>
</html>

<!-- Documentation navigation tree  -->
<script id="summary-tree-tpl" type="text/x-handlebars-template">
	{{#summary}}
		<h1>Page index of {{name}}</h1>
		<ul>
		{{#children}}
			<li><a href="{{url}}">{{name}}</a></li>
		{{/children}}
		</ul>
	{{/summary}}
</script>