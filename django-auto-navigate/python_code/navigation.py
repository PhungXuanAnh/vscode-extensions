import ast
import os
import sys
import astpretty


# https://stackoverflow.com/a/26374977/7639845
def str_node(node):
    if isinstance(node, ast.AST):
        fields = [
            (name, str_node(val))
            for name, val in ast.iter_fields(node)
            if name not in ("left", "right")
        ]
        rv = "%s(%s" % (node.__class__.__name__, ", ".join("%s=%s" % field for field in fields))
        return rv + ")"
    else:
        return repr(node)


def ast_visit(node, level=0):
    print("  " * level + str_node(node))
    for field, value in ast.iter_fields(node):
        if isinstance(value, list):
            for item in value:
                if isinstance(item, ast.AST):
                    ast_visit(item, level=level + 1)
        elif isinstance(value, ast.AST):
            ast_visit(value, level=level + 1)


def ast_visit1(node, level=0):
    if level > 2:
        return
    name = None
    try:
        if isinstance(node, ast.FunctionDef) or isinstance(node, ast.ClassDef):
            name = node.name
        if isinstance(node, ast.Assign):
            name = node.targets[0].id
        # if not name: name = node.__class__.__name__
    except Exception as e:
        astpretty.pprint(node, show_offsets=True)
        raise Exception(e)

    if name:
        print("  " * level + name)

    for field, value in ast.iter_fields(node):
        if isinstance(value, list):
            for item in value:
                if isinstance(item, ast.AST):
                    ast_visit1(item, level=level + 1)
        elif isinstance(value, ast.AST):
            ast_visit1(value, level=level + 1)


line_number = None


def ast_visit1_get_method_or_attribute_line_number(file_name, node, level=0, method=None, attribute=None):
    # global line_number
    if level > 2:
        return
    try:
        if isinstance(node, ast.FunctionDef) and node.name == method:
            # print("-------------------- 1")
            print(f"{file_name}:{node.lineno}")

        if (
            isinstance(node, ast.Assign)
            and not isinstance(node.targets[0], ast.Tuple)  # ignore case assignment: var1, var2 = method()
            and not isinstance(node.targets[0], ast.Attribute)  # ignore case assignment at level 0
            and node.targets[0].id == attribute
        ):
            # print("-------------------- 2")
            print(f"{file_name}:{node.lineno}")
    except Exception as e:
        astpretty.pprint(node, show_offsets=True)
        raise Exception(e)

    for field, value in ast.iter_fields(node):
        if isinstance(value, list):
            for item in value:
                if isinstance(item, ast.AST):
                    ast_visit1_get_method_or_attribute_line_number(
                        file_name, item, level=level + 1, method=method, attribute=attribute
                    )
        elif isinstance(value, ast.AST):
            ast_visit1_get_method_or_attribute_line_number(
                file_name, value, level=level + 1, method=method, attribute=attribute
            )


def get_current_attr_or_method_and_class_name(file_name, cursor_row):
    """
    This method find attribute or method in cursor position in file_name
    And that attribute or method be long which object
    Then try to find out this object is instance of which class
    """
    attribute = ""
    method = ""
    class_name = None

    """
        NOTE: yeu cau hien tai chi can lay duoc method hoac attribute (bo qua class name di , chua can tim)
        tim duoc vi tri method hoac attribute trong model
    """

    # NOTE: tam thoi khong can ham nay vi vscode da cho phep lay string tai vi tri cursor roi
    # chi can xac dinh no la method hay attribute thoi, bang cach kiem tra xem co () cuoi string hay khong

    return class_name, method, attribute


def find_file_name_and_position(workspace_dir, method=None, attribute=None, class_name=None):
    """
    This method try to find out file that contain class_name
    And location where method is declared or
        localtion where attribute is declared for the first time

    Then print(out these results to pass results to extention

    NOTE: tam thoi chua can class name, chi can method hoac attribute la co tim duoc
    vi tri cua no trong model roi
    """
    file_name = None
    for root, dirs, files in os.walk(workspace_dir):
        dirs[:] = [d for d in dirs if d not in [".venv"]]
        for file in files:
            if (
                file.endswith("models.py")
                or "models" in root
                and not file.endswith(".pyc")
                and file != "__init__.py"
            ):
                file_name = os.path.join(root, file)
                # print(file_name)

                with open(file_name, "r") as source:
                    tree = ast.parse(source.read())
                    # astpretty.pprint(tree, show_offsets=True)
                    # ast_visit1(tree)
                    ast_visit1_get_method_or_attribute_line_number(file_name, tree, method=method, attribute=attribute)



def test():
    with open(
        "/home/xuananh/repo/user-portal/user_portal/gene/models/affiliator.py", "r"
    ) as source:
        tree = ast.parse(source.read())
        # astpretty.pprint(tree, show_offsets=True)
        ast_visit1(tree)
    sys.exit()


if __name__ == "__main__":
    # test()

    file_name = ""
    cursor_row = 1
    # get_current_attr_or_method_and_class_name(file_name, cursor_row)
    workspace_dir = "/home/xuananh/repo/user-portal"
    # find_file_name_and_position(workspace_dir, attribute="cancel_reason_type")

    # TODO: voi method get_commission_rate se tra ve 1 danh sach file nhu sau:
    # /home/xuananh/repo/user-portal/user_portal/gene/models/affiliator.py:132
    # /home/xuananh/repo/user-portal/user_portal/gene/models/affiliator.py:627
    # /home/xuananh/repo/user-portal/user_portal/gene/models/affiliator.py:1438
    # /home/xuananh/repo/user-portal/user_portal/gene/models/advocate_organization.py:159
    # de cai tien thi ta se tra ve ca class name va file name cua cai method do
    # sau do tim cach show len 1 cai pop up de nguoi dung chon se nhay den file nao kieu ntn
    #           affiliator.py:1438:AffiliatorOrder.get_commission_rate()
    #           advocate_organization.py:159:AdvocateOrganizationCampaignPaymentRequest.get_commission_rate()
    workspace_dir = sys.argv[1][7:]
    property = sys.argv[2]
    property_type = sys.argv[3]
    # print(workspace_dir, property, property_type)
    
    if property_type == 'method':
        # print('------------ method')
        find_file_name_and_position(workspace_dir, method=property)

    if property_type == 'attribute':
        # print('------------ attribute')
        find_file_name_and_position(workspace_dir, attribute=property)

