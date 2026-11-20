"""
Verified STEM & Computer Science Curriculum Question Bank.
Provides zero-latency offline fallback assessments with pedagogical explanations.
"""
from typing import Any, Dict, List

VERIFIED_QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "Variables, Data Types & Operators": [
        {
            "question_text": "What is the output of type(5 / 2) in Python 3?",
            "question_type": "mcq",
            "options": ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
            "correct_answer": "<class 'float'>",
            "explanation": "In Python 3, the '/' division operator always yields a float (2.5), whereas '//' performs floor integer division.",
            "difficulty": "Easy",
        },
        {
            "question_text": "Python strings are mutable and can be changed in-place after creation.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "Python strings are immutable. Any modification method (like .replace() or slicing) returns a new string object.",
            "difficulty": "Easy",
        },
        {
            "question_text": "What does the expression 3 * (2 ** 3) evaluate to?",
            "question_type": "mcq",
            "options": ["24", "216", "18", "64"],
            "correct_answer": "24",
            "explanation": "Exponentiation (**) has higher precedence than multiplication (*). 2 ** 3 = 8, and 3 * 8 = 24.",
            "difficulty": "Easy",
        },
        {
            "question_text": "Which built-in Python function returns the unique integer memory identity of an object?",
            "question_type": "mcq",
            "options": ["id()", "ref()", "loc()", "memory()"],
            "correct_answer": "id()",
            "explanation": "The id() function returns the identity of the object, which is guaranteed to be unique and constant for this object during its lifetime.",
            "difficulty": "Medium",
        },
    ],
    "Control Flow & Loops": [
        {
            "question_text": "What will the following loop print? for i in range(1, 6, 2): print(i, end=' ')",
            "question_type": "mcq",
            "options": ["1 3 5", "1 2 3 4 5", "2 4 6", "1 3 5 7"],
            "correct_answer": "1 3 5",
            "explanation": "range(start, stop, step) begins at 1, increments by 2, and terminates before reaching 6, producing 1, 3, and 5.",
            "difficulty": "Easy",
        },
        {
            "question_text": "In Python, the 'else' block following a 'for' loop executes only if the loop was terminated with a 'break' statement.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "A for/else construct's 'else' block executes ONLY if the loop completed normally without encountering a 'break'.",
            "difficulty": "Medium",
        },
        {
            "question_text": "Which statement immediately exits the current iteration and jumps to the next iteration of the enclosing loop?",
            "question_type": "mcq",
            "options": ["continue", "pass", "break", "return"],
            "correct_answer": "continue",
            "explanation": "'continue' ends the current iteration cycle and advances to the next iteration, while 'break' terminates the entire loop.",
            "difficulty": "Easy",
        },
    ],
    "Functions & Scope": [
        {
            "question_text": "In Python, arguments are passed by value for immutable types and by object reference for mutable types.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Python uses 'pass-by-assignment' / 'call-by-object-reference'. Reassigning an immutable parameter does not affect the caller, whereas modifying a mutable object (like a list) modifies the original.",
            "difficulty": "Medium",
        },
        {
            "question_text": "What is the result of defining a default mutable argument like: def func(a, lst=[]): lst.append(a); return lst?",
            "question_type": "mcq",
            "options": [
                "The default list is created once at definition time and shared across subsequent calls",
                "A fresh empty list is created on every function call",
                "Python raises a SyntaxError at definition time",
                "The list is automatically garbage collected immediately after return",
            ],
            "correct_answer": "The default list is created once at definition time and shared across subsequent calls",
            "explanation": "Default parameter values are evaluated once when the function definition is executed, leading to persistent mutable accumulator bugs.",
            "difficulty": "Hard",
        },
    ],
    "Object-Oriented Programming (OOP)": [
        {
            "question_text": "Which dunder method is invoked when the built-in str() function or print() is called on a custom Python class?",
            "question_type": "mcq",
            "options": ["__str__", "__repr__", "__init__", "__print__"],
            "correct_answer": "__str__",
            "explanation": "__str__ defines the human-readable string representation of an object, while __repr__ is intended for unambiguous debugging.",
            "difficulty": "Easy",
        },
        {
            "question_text": "Python supports multiple inheritance using the C3 Linearization (MRO - Method Resolution Order) algorithm.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Python resolves multiple inheritance hierarchies deterministically using the C3 MRO algorithm accessible via Class.mro().",
            "difficulty": "Medium",
        },
    ],
    "Time & Space Complexity (Big-O)": [
        {
            "question_text": "What is the worst-case time complexity of binary search on a sorted array of size n?",
            "question_type": "mcq",
            "options": ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
            "correct_answer": "O(log n)",
            "explanation": "Binary search divides the search space in half at each step, yielding a logarithmic O(log n) time complexity.",
            "difficulty": "Easy",
        },
        {
            "question_text": "An algorithm with O(2^n) time complexity is more scalable than one with O(n^3) for large values of n.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "Exponential complexity O(2^n) grows vastly faster than polynomial complexity O(n^3) as n increases.",
            "difficulty": "Easy",
        },
        {
            "question_text": "What is the auxiliary space complexity of an in-place QuickSort algorithm implemented with optimal tail recursion?",
            "question_type": "mcq",
            "options": ["O(log n)", "O(n)", "O(n^2)", "O(1)"],
            "correct_answer": "O(log n)",
            "explanation": "Although QuickSort sorts the array in-place, the call stack occupies O(log n) auxiliary memory in balanced recursion.",
            "difficulty": "Medium",
        },
    ],
    "Arrays & Strings": [
        {
            "question_text": "What is the time complexity of checking if two strings of length n are anagrams using a frequency hash map?",
            "question_type": "mcq",
            "options": ["O(n)", "O(n^2)", "O(n log n)", "O(1)"],
            "correct_answer": "O(n)",
            "explanation": "Iterating over both strings to tally counts takes O(n) time, and comparing 26 character counts takes O(1) auxiliary time.",
            "difficulty": "Easy",
        },
        {
            "question_text": "The two-pointer technique can be applied to find two numbers that sum to a target in an unsorted array in O(n) time without extra memory.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "The two-pointer approach requires the array to be sorted first (which takes O(n log n)), or requires a hash set (which uses O(n) extra space).",
            "difficulty": "Medium",
        },
    ],
    "Binary Trees & BST": [
        {
            "question_text": "In a Binary Search Tree (BST), which tree traversal visits the nodes in strictly non-decreasing sorted order?",
            "question_type": "mcq",
            "options": ["In-order (Left, Root, Right)", "Pre-order (Root, Left, Right)", "Post-order (Left, Right, Root)", "Level-order (BFS)"],
            "correct_answer": "In-order (Left, Root, Right)",
            "explanation": "In-order traversal visits left subtree first (all smaller elements), then the current node, then right subtree (larger elements).",
            "difficulty": "Medium",
        },
        {
            "question_text": "The height of a degenerate (unbalanced) BST with n nodes can degrade to O(n).",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Inserting sorted elements into an unbalanced BST creates a linked-list shape with O(n) height and O(n) search time.",
            "difficulty": "Easy",
        },
    ],
    "Supervised Learning: Regression": [
        {
            "question_text": "What does a high Mean Squared Error (MSE) coupled with low training error indicate in regression models?",
            "question_type": "mcq",
            "options": [
                "Overfitting (high variance, model memorized training noise)",
                "Underfitting (high bias, model too simple)",
                "Optimal convergence at global minimum",
                "Data leakage across validation splits",
            ],
            "correct_answer": "Overfitting (high variance, model memorized training noise)",
            "explanation": "A very low training error combined with high test error is the hallmark of overfitting/high variance.",
            "difficulty": "Medium",
        }
    ],
    "React State Management & Hooks": [
        {
            "question_text": "React state updates triggered by the useState hook are executed asynchronously and batched.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "React batches multiple state updates inside event handlers and lifecycle events to optimize DOM re-rendering performance.",
            "difficulty": "Easy",
        },
        {
            "question_text": "When using useEffect with an empty dependency array ([]), when does the cleanup function execute?",
            "question_type": "mcq",
            "options": [
                "When the component unmounts",
                "Before every re-render",
                "Never, because dependencies never change",
                "Immediately after the initial mount",
            ],
            "correct_answer": "When the component unmounts",
            "explanation": "An empty dependency array causes the effect to run once on mount, and its cleanup function executes once on component unmount.",
            "difficulty": "Medium",
        },
    ],
}
