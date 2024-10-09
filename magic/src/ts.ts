import * as ts from 'typescript';

const SK = ts.SyntaxKind;

type QuBit = number;
enum Qu {
    True = 16 | 0,
    Any = 8 | 0,
    False = 4 | 0,
    Super = 20 | 0,
    Sub = 0 | 0
}

const OptionsIsIValue = new Map([
    ['return', Qu.False],
    ['is', Qu.True],
    ['slot', Qu.False]
]);

const TagOptionsIsIValue = new Map([
    ...OptionsIsIValue,
    ['attr', Qu.Super],
    ['class', Qu.Super],
    ['style', Qu.Super],
    ['events', Qu.Super],
    ['bind', Qu.Super]
]);

const VTypes = ['VApp', 'VComponent', 'VFragment', 'VExtension', 'VReactive'];
const CTypes = ['App', 'Component', 'Fragment', 'Extension'];

export const transform = (program : ts.Program) => (ctx : ts.TransformationContext) =>  (sourceFile : ts.SourceFile) => {
    const checker  = program.getTypeChecker();
    const factory = ctx.factory;

    const importWatchFn : string[] = [];
    let vType = false;

    function report (node: ts.Node, message: string) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1}, ${character + 1}): ${message}`);
    }

    function isIValueTypeName(name : string) {
        return ['IValue', 'Pointer'].includes(name);
    }

    function isIValue (node : ts.Node) {
        const type = checker.getTypeAtLocation(node);
        return type.aliasSymbol && isIValueTypeName(type.aliasSymbol.escapedName.toString());
    }

    function isIValueParameter (node : ts.Node) {
        return ts.isParameter(node) &&
            node.type &&
            ts.isTypeReferenceNode(node.type) &&
            ts.isIdentifier(node.type.typeName) &&
            isIValueTypeName(node.type.typeName.escapedText.toString());
    }

    function isExpression (node : ts.Node) : node is ts.Expression {
        // @ts-ignore
        return ts.isExpression(node);
    }

    function toExpression (node : ts.Node) : ts.Expression {
        if (isExpression(node)) {
            return node;
        }
        if (ts.isExpressionStatement(node)) {
            return node.expression;
        }
        if (ts.isJsxExpression(node) && node.expression) {
            return node.expression;
        }

        report(node, "internal error");
        throw new Error("internal error");
    }

    function isJsx (node : ts.Node) : node is ts.JsxElement | ts.JsxFragment | ts.JsxSelfClosingElement {
        return ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node);
    }

    function findVImport (items : ts.NamespaceImport | ts.NamedImports | undefined) : ts.ImportSpecifier[] {
        let ret : ts.ImportSpecifier[] = [];
        let hasV = false;

        if (items && ts.isNamedImports(items)) {
            items.elements.forEach(item => {
                let name = item.name.escapedText.toString();
                if (name === 'v') {
                    hasV = true;
                }
                if (['watch', 'expr'].includes(name)) {
                    importWatchFn.push(name);
                }
                if (!VTypes.includes(name)) {
                    ret.push(item);
                }
            });
        }
        if (!hasV) {
            ret.push(factory.createImportSpecifier(false, undefined,
                factory.createIdentifier('v')));
        }

        return ret;
    }

    function visitor (node: ts.Node) : ts.VisitResult<ts.Node> {
        if (
            ts.isImportDeclaration(node) &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            node.moduleSpecifier.text == 'vasille-magic'
        ) {
            vType = true;
            return factory.createImportDeclaration(
                node.modifiers,
                factory.createImportClause(
                    node.importClause?.isTypeOnly || false,
                    node.importClause?.name,
                    factory.createNamedImports(findVImport(node.importClause?.namedBindings))
                ),
                factory.createStringLiteral('vasille-less'));
        }
        if (!vType) {
            return ts.visitEachChild(node, visitor, ctx);
        }
        if (ts.isVariableDeclaration(node) && node.type && node.initializer &&
            (ts.isArrowFunction(node.initializer) || ts.isFunctionDeclaration(node.initializer)) &&
            ts.isTypeReferenceNode(node.type) && ts.isIdentifier(node.type.typeName) &&
            VTypes.includes(node.type.typeName.escapedText.toString())
        ) {

            return factory.createVariableDeclaration(node.name, undefined, undefined,
                factory.createCallExpression(factory.createPropertyAccessExpression(
                    factory.createIdentifier('v'), node.type.typeName.escapedText.toString().substring(1).toLowerCase()
                ), undefined, [componentBodyArrowFunction(node.initializer)]))
        }
        return ts.visitEachChild(node, visitor, ctx);
    }

    function componentBodyArrowFunction (node : ts.ArrowFunction | ts.FunctionDeclaration) : ts.ArrowFunction {
        return factory.createArrowFunction(undefined, undefined, node.parameters, node.type, undefined,
            componentBodyArrowFuncBody(node.body));
    }

    function componentBodyArrowFuncBody (node : ts.ConciseBody | undefined) : ts.ConciseBody {
        if (node) {
            return ts.visitEachChild(node, componentBodyVisitor, ctx);
        }

        return factory.createBlock([], true);
    }

    function componentBodyVisitor(node : ts.Node) : ts.VisitResult<ts.Node> {
        if (
            !ts.isVariableDeclaration(node) &&
            !ts.isPropertyDeclaration(node) &&
            isExpression(node) &&
            isIValue(node)
        ) {
            const parent = node.parent;

            if (ts.isVariableDeclaration(parent) && !isIValue(parent) && parent.initializer === node) {
                return dereferenceVisitor(node);
            }
            if (ts.isBinaryExpression(parent)) {
                if ([SK.AmpersandAmpersandToken, SK.BarBarToken].includes(parent.operatorToken.kind)) {
                    return checkAndDereferenceVisitor(node);
                }
                if (!isIValue(parent)) {
                    return dereferenceVisitor(node);
                }
                if (parent.operatorToken.kind === SK.EqualsToken) {
                    if (parent.right === node && !isIValue(parent.left)) {
                        return dereferenceVisitor(node);
                    }
                    if (parent.left === node && !isIValue(parent.right)) {
                        return dereferenceVisitor(node);
                    }
                }
            }
            if (ts.isPrefixUnaryExpression(parent)) {
                if (parent.operator !== SK.ExclamationToken) {
                    return dereferenceVisitor(node);
                }
                else {
                    return checkAndDereferenceVisitor(node);
                }
            }
            if (ts.isCallOrNewExpression(parent) && parent.arguments) {
                const index = parent.arguments.indexOf(toExpression(node));
                const type = checker.getTypeAtLocation(parent.expression);
                if (type.symbol.valueDeclaration && index != -1) {
                    if (ts.isFunctionDeclaration(type.symbol.valueDeclaration)) {
                        const parameter = type.symbol.valueDeclaration.parameters[index];

                        if (!isIValueParameter(parameter)) {
                            return dereferenceVisitor(node);
                        }
                    }
                }
            }
            if (((ts.isPropertyAccessExpression(parent) || ts.isPropertyAccessChain(parent)) &&
                    !parent.name.escapedText.toString().startsWith('$')) ||
                ts.isElementAccessExpression(parent) || ts.isElementAccessChain(parent)
            ) {
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier('v'), 'of'),
                    undefined, [toExpression(node)]);
            }
        }
        if (ts.isCallExpression(node)) {
            if (
                node.expression && ts.isIdentifier(node.expression) &&
                importWatchFn.includes(node.expression.escapedText.toString())
            ) {
                if (node.arguments[0]) {
                    return factory.createCallExpression(
                        node.expression, node.typeArguments,
                        exprVisitor(node.arguments[0]));
                }
            }
        }
        if (ts.isExpressionStatement(node) && isJsx(node.expression)) {
            return jsxVisitor(node.expression);
        }
        return ts.visitEachChild(node, componentBodyVisitor, ctx);
    }

    function dereferenceVisitor (node: ts.Node): ts.Expression {
        return factory.createPropertyAccessChain(toExpression(node), undefined, '$');
    }

    function checkAndDereferenceVisitor (node: ts.Node): ts.VisitResult<ts.Node> {
        return factory.createBinaryExpression(
            toExpression(node),
            ts.SyntaxKind.AmpersandAmpersandToken,
            factory.createPropertyAccessChain(
                toExpression(node),
                undefined,
                '$'));
    }

    function varNameFromNode (node : ts.Node) : string {
        return '$' + (
            ts.isIdentifier(node)
            ? node.escapedText.toString()
            : node.getFullText().trim().replace(/[^\p{L}\w]/gu, '_'));
    }

    function blacklistBindingElement (element: ts.BindingElement|ts.VariableDeclaration, blacklist: Set<string>) {
        const name = element.name;

        if (ts.isArrayBindingPattern(name)) {
            for (const element of name.elements) {
                if (ts.isBinaryExpression(element)) {
                    blacklistBindingElement(element, blacklist);
                }
            }
        }
        if (ts.isObjectBindingPattern(name)) {
            for (const element of name.elements) {
                blacklistBindingElement(element, blacklist);
            }
        }
        if (ts.isIdentifier(name)) {
            blacklist.add(name.text);
        }
    }

    function iValueExprVisitor (exprs : ts.Expression[], names : Set<string>, blacklist: Set<string>, node: ts.Node)
        : Exclude<ts.VisitResult<ts.Node>, undefined> {
        if (ts.isVariableDeclaration(node)) {
            blacklistBindingElement(node, blacklist);
        }
        if (ts.isVariableDeclarationList(node)) {
            for (const declaration of node.declarations) {
                blacklistBindingElement(declaration, blacklist);
            }
        }
        if (isExpression(node) && isIValue(node)) {
            if (
                /*1*/!((ts.isPropertyAccessExpression(node.parent) || ts.isPropertyAccessChain(node.parent)) &&
                    node.parent.name.escapedText.toString().startsWith('$')) &&
                /*2*/!ts.isBinaryExpression(node) &&
                /*3*/!ts.isPrefixUnaryExpression(node) && !ts.isPostfixUnaryExpression(node)
            ) {
                const name = varNameFromNode(node);

                if (!names.has(name) && !blacklist.has(name.substring(1))) {
                    names.add(name);
                    exprs.push(toExpression(node));
                }

                if (names.has(name)) {
                    return factory.createIdentifier(name);
                }

                return node;
            }

        }
        if (ts.isExpressionStatement(node) && isJsx(node.expression)) {
            return jsxVisitor(node.expression);
        }
        if (isJsx(node)) {
            return jsxVisitor(node);
        }
        return ts.visitEachChild(node, iValueExprVisitor.bind(null, exprs, names, blacklist), ctx);
    }

    function exprVisitor (node: ts.Node, returnSelfIfNothingTracked = false): ts.Expression[] {
        const tracked : ts.Expression[] = [];
        const names = new Set<string>();
        const children = iValueExprVisitor(tracked, names, new Set, node);
        const child = children instanceof Array ? children[0] : children;
        const parameters : ts.ParameterDeclaration[] = [];

        tracked.forEach((entity) => {
            const name = varNameFromNode(entity);

            parameters.push(factory.createParameterDeclaration(
                undefined, undefined, name));
        });

        let arrow : ts.ArrowFunction;

        if (parameters.length === 0 && returnSelfIfNothingTracked) {
            return [toExpression(child)];
        }
        if ((ts.isArrowFunction(child) || ts.isFunctionDeclaration(child)) && child.body) {
            arrow = factory.createArrowFunction(
                undefined, child.typeParameters, parameters, child.type,
                ts.isArrowFunction(child) ? child.equalsGreaterThanToken : undefined,
                child.body);
        }
        else {
            arrow = factory.createArrowFunction(
                undefined, undefined, parameters, undefined,
                undefined, toExpression(child));
        }

        return [arrow, ...tracked];
    }

    enum jsxTagType {
        Class,
        Function,
        Tag,
        System
    }

    function getClassInputType (declaration : ts.ClassDeclaration)
        : [string | undefined, ts.Type | undefined] {
        let templateType  : ts.Type | undefined = undefined;
        let aliasName : string | undefined = undefined;

        if (declaration.name) {
            const alias = declaration.name.escapedText.toString() || '';

            if (CTypes.includes(alias)) {
                aliasName = alias;
            }
        }

        if (declaration.typeParameters) {
            templateType = checker.getTypeAtLocation(declaration.typeParameters[0]);
        }

        if (!(aliasName && templateType) && declaration.heritageClauses) {
            const clause = declaration.heritageClauses[0];

            if (clause.token == ts.SyntaxKind.ExtendsKeyword && clause.types.length > 0) {
                clause.types.forEach(type => {
                    if (type.typeArguments && type.typeArguments[0] && ts.isIdentifier(type.expression) &&
                        CTypes.includes(type.expression.escapedText.toString())
                    ) {
                        aliasName = type.expression.escapedText.toString();
                        templateType = checker.getTypeAtLocation(type.typeArguments[0]);
                    }
                });
            }
        }

        return [aliasName, templateType];
    }

    function checkType (type : ts.Type) : number {
        const [isIValue, isOther, isAny] = checkTypeCapabilities(type);
        return (isIValue ? Qu.True : 0) | (isOther ? Qu.False : 0) | (isAny ? Qu.Any : 0);
    }

    function checkTypeOfNode (node : ts.Node) : QuBit {
        return checkType(checker.getTypeAtLocation(node));
    }

    function checkTypeCapabilities (itemType : ts.Type) {
        let isIValueItem = false;
        let isOtherItem = false;
        let isAny = false;

        if (itemType.symbol && isIValueTypeName(itemType.symbol.name.toString())) {
            isIValueItem = true;
        }
        else if (itemType.isUnionOrIntersection()) {
            itemType.types.forEach((subItemType) => {
                const [isIValueSubItem, isOtherSubItem] = checkTypeCapabilities(subItemType);
                isIValueItem = isIValueItem || isIValueSubItem;
                if (itemType.isUnion()) {
                    isOtherItem = isOtherItem || isOtherSubItem;
                }
            });
        }
        else if (itemType &&
            [ts.TypeFlags.Null, ts.TypeFlags.Undefined, ts.TypeFlags.Void, ts.TypeFlags.Any].includes(itemType.flags)
        ) {
            isAny = true;
        }
        else if (itemType) {
            isOtherItem = true;
        }

        return [isIValueItem, isOtherItem, isAny];
    }

    function getTypeFieldsData (alias : string, type : ts.Type, node : ts.Node) {
        const base = ['VApp', 'VFragment', 'App', 'Fragment'].includes(alias) ? OptionsIsIValue : TagOptionsIsIValue;
        const fields = new Map([...base]);
        const returns : Map<string, number> = new Map;

        function fillReturn (returnType : ts.Type) {
            checker.getPropertiesOfType(returnType).forEach(item => {
                const type = checker.getTypeOfSymbolAtLocation(item, node);
                // console.log('type ->', type);
                const name = item.escapedName.toString();
                returns.set(name, checkType(type));
            });
        }

        if ((VTypes.includes(alias) || CTypes.includes(alias))) {
            if (type.aliasTypeArguments && type.aliasTypeArguments.length) {
                checker.getPropertiesOfType(type.aliasTypeArguments[0]).forEach((item) => {
                    const itemType = checker.getTypeOfSymbolAtLocation(item, node);
                    const name = item.escapedName.toString();

                    if (name === 'return') {
                        fillReturn(itemType);
                    }
                    if (!fields.has(name)) {
                        fields.set(name, checkType(itemType));
                    }
                });
            }
            else if (type.symbol && type.symbol.members) {
                type.symbol.members.forEach(member => {
                    const itemType = checker.getTypeOfSymbolAtLocation(member, node);
                    const name = member.escapedName.toString();

                    if (name === 'return') {
                        fillReturn(itemType);
                    }
                    if (!fields.has(name)) {
                        fields.set(name, checkType(itemType));
                    }
                });
            }
        }

        return {fields, returns};
    }

    function jsxTagData (node : ts.JsxTagNameExpression) {
        let tagType = jsxTagType.Tag;
        let target : ts.Expression | ts.PropertyAccessExpression | string;
        let fields = TagOptionsIsIValue, returns = new Map<string, Qu>();

        const type = checker.getTypeAtLocation(node);
        const declaration = type.symbol?.valueDeclaration || type.symbol?.declarations?.[0];

        if (declaration && ts.isClassDeclaration(declaration)) {
            const [alias, templateType] = getClassInputType(declaration);

            if (alias && templateType) {
                tagType = jsxTagType.Class;
                ({fields, returns} = getTypeFieldsData(alias, templateType, node));
            }
        }

        if (declaration && ts.isFunctionTypeNode(declaration)) {
            tagType = jsxTagType.Function;
            if (type.aliasSymbol && VTypes.includes(type.aliasSymbol.escapedName.toString())) {
                ({fields, returns} = getTypeFieldsData(type.aliasSymbol.escapedName.toString(), type, node));
            }
            else {
                fields = TagOptionsIsIValue;
            }
        }

        if (tagType != jsxTagType.Tag && !ts.isJsxNamespacedName(node)) {
            target = node;
        }
        else {
            target = node.getText().trim();

            if (['v-if', 'v-else', 'v-elif', 'v-for', 'v-debug', 'v-portal'].includes(target)) {
                tagType = jsxTagType.System;
            }
            else {
                returns = new Map([['node', Qu.False]]);
            }
        }

        return {tagType, target, fields, returns};
    }

    interface InternalOptions {
        return : Map<ts.MemberName, {expr: ts.Expression, ivalue?: boolean}>;
        is     : ts.ObjectLiteralElementLike[];
        attr   : ts.ObjectLiteralElementLike[];
        class  : ts.Expression[];
        style  : ts.ObjectLiteralElementLike[];
        events : ts.ObjectLiteralElementLike[];
        bind   : ts.ObjectLiteralElementLike[];
        set    : ts.ObjectLiteralElementLike[];
        props  : ts.ObjectLiteralElementLike[];
        opts   : ts.Expression[];
    }

    function toJsxExpression(node : ts.Identifier | ts.JsxExpression | ts.Expression, type : QuBit) : ts.Expression {
        let typeBits = checkTypeOfNode(node);
        let expr : ts.Expression | undefined;

        if (ts.isIdentifier(node)) {
            expr = node;
        }
        else if (ts.isJsxExpression(node) || isExpression(node)) {
            if (ts.isJsxExpression(node) && node.expression && ts.isIdentifier(node.expression)) {
                expr = node.expression;
                typeBits = checkTypeOfNode(node.expression);
            }
            else if (ts.isJsxExpression(node) && node.expression &&
                ts.isCallExpression(node.expression) && node.expression.expression &&
                ts.isIdentifier(node.expression.expression) &&
                importWatchFn.includes(node.expression.expression.escapedText.toString()) &&
                node.expression.arguments[0]
            ) {
                const callExpr = node.expression;
                expr = factory.createCallExpression(
                    callExpr.expression, callExpr.typeArguments, exprVisitor(callExpr.arguments[0]));
                typeBits = Qu.True;
            }
            else {
                if (type & Qu.True) {
                    const args = exprVisitor(node, true);

                    if (args.length > 1) {
                        expr = factory.createCallExpression(
                            factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'expr'),
                            undefined, args);
                        typeBits = Qu.True;
                    }
                    else {
                        expr = args[0];
                        typeBits = checkTypeOfNode(args[0]);
                    }
                }
                else {
                    const result = componentBodyVisitor(node);

                    if (result && !(result instanceof Array) && ts.isJsxExpression(result) && result.expression) {
                        expr = result.expression;
                        typeBits = checkTypeOfNode(result.expression);
                    }
                    else if (result && !(result instanceof Array) && isExpression(result)) {
                        expr = result;
                    }
                }
            }
        }

        if (typeBits & type && expr) {
            return expr;
        }
        else if (expr) {
            if (typeBits & Qu.True && type & Qu.False) {
                return dereferenceVisitor(expr);
            }
            else if (type & Qu.True && !(type & Qu.False)) {
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'ref'),
                    undefined, [expr]);
            }
            else {
                return expr;
            }
        }
        else {
            return factory.createTrue();
        }
    }

    function propertyNameFromString(name : string) : ts.PropertyName {
        if (/^[\p{L}\d_]+$/u.test(name)) {
            return factory.createIdentifier(name);
        }
        else {
            return factory.createStringLiteral(name);
        }
    }

    function jsxAttrsToObject (attrs : ts.JsxAttributes, tagType : jsxTagType, fields : Map<string, number>)
        : InternalOptions {
        const ret : InternalOptions = {
            return : new Map(),
            is     : [],
            attr   : [],
            bind   : [],
            class  : [],
            events : [],
            props  : [],
            set    : [],
            style  : [],
            opts   : []
        };

        function addTo(arr : ts.ObjectLiteralElementLike[], name : string, expr : ts.Expression, type : QuBit) {
            if (type !== Qu.Sub) {
                arr.push(factory.createPropertyAssignment(propertyNameFromString(name), toJsxExpression(expr, type)));
            }
        }

        attrs.properties.forEach((node) => {
            if (ts.isJsxAttribute(node)) {
                const split = ts.isIdentifier(node.name)
                  ? node.name.escapedText.toString().split(':')
                  : [
                      node.name.namespace.escapedText.toString(),
                      node.name.name.escapedText.toString()
                  ];
                const type = split[0];
                const prop = split[1];
                const defaultInitializer = factory.createTrue();

                let initializer : ts.Expression = node.initializer || defaultInitializer;

                // Parse folded expressions
                while ((ts.isJsxExpression(initializer) || ts.isParenthesizedExpression(initializer)) &&
                    initializer.expression) {
                    initializer = initializer.expression;
                }

                if (type === 'class') {
                    if (!prop) {
                        if (ts.isArrayLiteralExpression(initializer)) {
                            initializer.forEachChild(node => {
                                if (isExpression(node)) {
                                    ret.class.push(toJsxExpression(node, Qu.Super));
                                }
                            });
                        }
                        else if (ts.isStringLiteral(initializer)) {
                            for (let str of initializer.text.split(/\s+/)) {
                                ret.class.push(factory.createStringLiteral(str));
                            }
                        }
                        else {
                            ret.class.push(toJsxExpression(initializer, Qu.Super));
                        }
                    }
                    if (prop) {
                        if (initializer === defaultInitializer) {
                            ret.class.push(factory.createStringLiteral(prop));
                        }
                        else {
                            ret.class.push(
                                factory.createObjectLiteralExpression([
                                    factory.createPropertyAssignment(
                                        propertyNameFromString(prop),
                                        toJsxExpression(initializer, Qu.Super))
                                ]));
                        }
                    }
                }
                else if (type === 'style') {
                    if (!prop && ts.isObjectLiteralExpression(initializer)) {
                        initializer.forEachChild(node => {
                            if (ts.isPropertyAssignment(node)) {
                                ret.style.push(factory.createPropertyAssignment(
                                    node.name, toJsxExpression(node.initializer, Qu.Super)));
                            }
                        });
                    }
                    if (prop) {
                        addTo(ret.style, prop, initializer, Qu.Super);
                    }
                }
                else if (/on[a-z]+/.test(type)) {
                    addTo(ret.events, type.substring(2), initializer, Qu.False);
                }
                else if (['is', 'attr', 'set', 'bind'].includes(type) && prop) {
                    // same as ret[type], but this make ts happy
                    const map = new Map([
                        ['is', ret.is],
                        ['attr', ret.attr],
                        ['set', ret.set],
                        ['bind', ret.bind]
                    ]);
                    const arr = map.get(type);

                    arr && addTo(arr, prop, initializer, fields.get(type) || Qu.False);
                }
                else if (type === 'vx' && ['attr', 'set', 'bind'].includes(prop) &&
                    ts.isObjectLiteralExpression(initializer)
                ) {
                    const map = new Map([
                        ['attr', ret.attr],
                        ['set', ret.set],
                        ['bind', ret.bind]
                    ]);
                    const arr = map.get(prop);

                    initializer.forEachChild(node => {
                        if (ts.isPropertyAssignment(node)) {
                            arr && addTo(arr, node.name.getText(), node.initializer, fields.get(prop) || Qu.False);
                        }
                    });
                }
                else if (type === 'returns' && prop) {
                    ret.return.set(factory.createIdentifier(prop), {expr: initializer, ivalue: isIValue(initializer)});
                }
                else if (type === 'return' && !prop && ts.isObjectLiteralExpression(initializer)) {
                    initializer.forEachChild(node => {
                        if (ts.isPropertyAssignment(node) && ts.isMemberName(node.name)) {
                            ret.return.set(node.name, {expr: node.initializer, ivalue: isIValue(node.initializer)});
                        }
                    });
                }
                else {
                    if (tagType === jsxTagType.Tag) {
                        addTo(ret.attr, type, initializer, Qu.Super);
                    }
                    else if (tagType === jsxTagType.System) {
                        addTo(ret.props, type, initializer, Qu.True);
                    }
                    else {
                        addTo(ret.props, type, initializer, fields.get(type) || Qu.Any);
                    }
                }
            }
            else if (ts.isJsxSpreadAttribute(node)) {
                ret.opts.push(node.expression);
            }
        });

        return ret;
    }

    function jsxAttrsToExpression (inAttrs : ts.JsxAttributes, tagType : jsxTagType, fields :  Map<string, number>)
        : [ts.Expression, InternalOptions] {
        const attrs = jsxAttrsToObject(inAttrs, tagType, fields);
        const attrArray : ts.ObjectLiteralElementLike[] = [];

        function addProperty(name : string, props : ts.ObjectLiteralElementLike[]) {
            attrArray.push(factory.createPropertyAssignment(
                propertyNameFromString(name),
                factory.createObjectLiteralExpression(props)));
        }

        attrs.attr.length && addProperty('v:attr', attrs.attr);
        attrs.bind.length && addProperty('v:bind', attrs.bind);
        attrs.set.length && addProperty('v:set', attrs.set);
        attrs.is.length && addProperty('v:is', attrs.is);
        attrs.events.length && addProperty('v:events', attrs.events);
        attrs.style.length && addProperty('style', attrs.style);

        attrs.class.length && attrArray.push(
            factory.createPropertyAssignment('class', factory.createArrayLiteralExpression(attrs.class)));

        attrs.props.length && attrs.props.forEach((prop) => {
            attrArray.push(prop);
        });

        const parsedAttrs = factory.createObjectLiteralExpression(attrArray);

        if (attrs.opts.length) {
            attrs.opts.unshift(parsedAttrs);
            return [factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'merge'),
                undefined, attrs.opts), attrs];
        }
        else {
            return [parsedAttrs, attrs];
        }
    }

    function getChildren(node : ts.JsxElement | ts.JsxFragment) {

        function createText (exp : ts.Expression) {
            return factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'text'),
                undefined, [exp]);
        }

        const rawChildren = node.children.map(child => {
            if (isJsx(child)) {
                return jsxVisitor(child);
            }
            else if (ts.isJsxText(child)) {
                const rawText = child.text;
                const text = rawText.includes('\n') ? rawText.replace(/^\s+/gm, '').replace(/^\s+$/gm, '') : rawText;

                if (text.length) {
                    return createText(factory.createStringLiteral(text));
                }
            }
            else if (ts.isJsxExpression(child) && child.expression) {
                const nodeType = checkTypeOfNode(child.expression);

                if (ts.isStringLiteral(child.expression)) {
                    return createText(child.expression);
                }
                else if (nodeType & Qu.Super || (nodeType & Qu.Any && !ts.isCallExpression(child.expression))) {

                    if (nodeType & Qu.Any) {
                        report(child.expression, 'Any type detected, this can cause generation of wrong js code');
                    }

                    return createText(toJsxExpression(child.expression, Qu.Super));
                }
                else {
                    return toJsxExpression(child.expression, Qu.False);
                }
            }
        });

        const children : ts.Expression[] = [];

        rawChildren.forEach(item => item && children.push(item));

        return factory.createArrowFunction(undefined, undefined, [], undefined, undefined,
            factory.createBlock(children.map(child => factory.createExpressionStatement(child)), true));
    }

    function fixExpr (expr: ts.Expression, ivalue?: boolean) {
        return ivalue ? factory.createPropertyAccessExpression(expr, '$') : expr;
    }

    function jsxVisitor (node : ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment) : ts.Expression {
        let tagData : ReturnType<typeof jsxTagData> | undefined;
        let attrs : ts.Expression | undefined;
        let internalAttrs : InternalOptions | undefined;
        let arrow : ts.ArrowFunction | undefined;

        if (ts.isJsxSelfClosingElement(node)) {
            tagData = jsxTagData(node.tagName);
            [attrs, internalAttrs] = jsxAttrsToExpression(node.attributes, tagData.tagType, tagData.fields);
        }
        else if (ts.isJsxElement(node)) {
            const openingElement = node.openingElement;

            tagData = jsxTagData(openingElement.tagName);
            [attrs, internalAttrs] = jsxAttrsToExpression(openingElement.attributes, tagData.tagType, tagData.fields);

            arrow = getChildren(node);
        }
        else if (ts.isJsxFragment(node)) {
            arrow = getChildren(node);
        }

        const args : ts.Expression[] = [];

        attrs && args.push(attrs);
        arrow && args.push(arrow);

        if (tagData) {
            let callExpr : ts.Expression | undefined = undefined;

            if (tagData.tagType === jsxTagType.Function && typeof tagData.target !== "string") {
                callExpr = factory.createCallExpression(tagData.target, undefined, args);
            }
            if (tagData.tagType == jsxTagType.Class && typeof tagData.target !== "string" && attrs) {
                const args : ts.Expression[] = [factory.createNewExpression(tagData.target, undefined, [attrs])];

                arrow && args.push(arrow);

                callExpr = factory.createCallExpression(
                    factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'create'),
                    undefined, args);
            }
            if (tagData.tagType == jsxTagType.Tag && typeof tagData.target === "string") {
                callExpr = factory.createCallExpression(
                    factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'tag'),
                    undefined, [factory.createStringLiteral(tagData.target), ...args]
                );
            }

            function fixReturnAssign (source : ts.Expression, field : ts.MemberName, expr : ts.Expression, ivalue ?: boolean) {
                const prop = factory.createPropertyAccessExpression(source, field);

                return ivalue
                    ? factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier('v'), 'sv'
                        ), undefined, [expr, prop])
                    : factory.createBinaryExpression(expr, SK.EqualsToken,
                        fixExpr(prop, tagData?.returns.get(field.escapedText.toString()) === Qu.True));
            }

            if (callExpr) {
                if (!internalAttrs ||  !internalAttrs.return.size) {
                    return callExpr;
                }
                if (internalAttrs.return.size === 1) {
                    const [field, {expr, ivalue}] = [...internalAttrs.return][0];
                    return fixReturnAssign(callExpr, field, expr, ivalue);
                }

                const name = 'vasille_magic_internal_$$$';
                const statements : ts.Statement[] = [
                    factory.createVariableStatement([], factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(name, undefined, undefined, callExpr)
                    ], ts.NodeFlags.Const))];

                for (const [field, {expr, ivalue}] of internalAttrs.return) {
                    statements.push(factory.createExpressionStatement(
                        fixReturnAssign(factory.createIdentifier(name), field, expr, ivalue)));
                }

                return factory.createImmediatelyInvokedFunctionExpression(statements);
            }

            if (tagData.tagType == jsxTagType.System && typeof tagData.target === "string") {
                let func = tagData.target.substring(2);
                let expr : ts.Expression | undefined;
                let slot : ts.Expression | undefined;

                internalAttrs && internalAttrs.props.forEach(item => {
                    if (ts.isPropertyAssignment(item)) {
                        let name : string = '';

                        if (ts.isIdentifier(item.name)) {
                            name = item.name.escapedText.toString();
                        }
                        if (ts.isStringLiteral(item.name)) {
                            name = item.name.text;
                        }

                        if (name === 'model') {
                            expr = item.initializer;
                        }
                        if (name === 'slot') {
                            slot = item.initializer;
                        }
                    }
                });

                if (func !== 'else' && !expr) {
                    expr = factory.createPropertyAccessExpression(factory.createIdentifier('v'), 'alwaysFalse');
                }
                if (func === 'else' && expr) {
                    func = 'elif';
                }

                if (!slot) {
                    slot = arrow;
                }

                if (slot) {
                    return factory.createCallExpression(
                        factory.createPropertyAccessExpression(factory.createIdentifier('v'), func),
                        undefined, expr ? [expr, slot] : [slot]);
                }
            }
        }
        else if (arrow) {
            return factory.createCallExpression(arrow, undefined, undefined);
        }

        return factory.createTrue();
    }

    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
};

export default transform;
