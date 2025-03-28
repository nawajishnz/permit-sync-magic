
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FAQsManager = () => {
  // Mock initial data structure - in a real app, this would come from API/database
  const initialCategories = [
    {
      id: 'application',
      name: 'Application Process',
      questions: [
        {
          id: 'apply-online',
          question: 'How do I apply for a visa online?',
          answer: 'To apply for a visa online through Permitsy, simply create an account, complete your profile, select your destination country, choose the appropriate visa type, fill out the application form, upload the required documents, pay the fees, and submit your application. Our system will guide you through each step.'
        },
        {
          id: 'processing-time',
          question: 'How long does visa processing take?',
          answer: 'Processing times vary depending on the destination country, visa type, and current application volumes. Tourist visas typically take 5-15 business days, while work or study visas may take 2-8 weeks. You can check estimated processing times for your specific visa on our website.'
        }
      ]
    },
    {
      id: 'fees',
      name: 'Fees & Payments',
      questions: [
        {
          id: 'visa-cost',
          question: 'How much does a visa cost?',
          answer: 'Visa fees vary by country and visa type. They typically include the government fee (set by the embassy/consulate) and our service fee. You can view the complete fee breakdown before submitting your application.'
        }
      ]
    }
  ];

  const [categories, setCategories] = useState(initialCategories);
  const [editingQuestion, setEditingQuestion] = useState<null | {
    categoryId: string;
    questionId: string;
    question: string;
    answer: string;
  }>(null);
  const [newQuestion, setNewQuestion] = useState({
    categoryId: '',
    question: '',
    answer: ''
  });
  const [newCategory, setNewCategory] = useState('');

  const handleEditQuestion = (categoryId: string, questionId: string, question: string, answer: string) => {
    setEditingQuestion({
      categoryId,
      questionId,
      question,
      answer
    });
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    setCategories(categories.map(category => {
      if (category.id === editingQuestion.categoryId) {
        return {
          ...category,
          questions: category.questions.map(q => {
            if (q.id === editingQuestion.questionId) {
              return {
                ...q,
                question: editingQuestion.question,
                answer: editingQuestion.answer
              };
            }
            return q;
          })
        };
      }
      return category;
    }));

    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (categoryId: string, questionId: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          questions: category.questions.filter(q => q.id !== questionId)
        };
      }
      return category;
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.categoryId || !newQuestion.question || !newQuestion.answer) return;

    const questionId = newQuestion.question.toLowerCase().replace(/[^a-z0-9]/g, '-');

    setCategories(categories.map(category => {
      if (category.id === newQuestion.categoryId) {
        return {
          ...category,
          questions: [
            ...category.questions,
            {
              id: questionId,
              question: newQuestion.question,
              answer: newQuestion.answer
            }
          ]
        };
      }
      return category;
    }));

    setNewQuestion({
      categoryId: '',
      question: '',
      answer: ''
    });
  };

  const handleAddCategory = () => {
    if (!newCategory) return;

    const categoryId = newCategory.toLowerCase().replace(/[^a-z0-9]/g, '-');

    setCategories([
      ...categories,
      {
        id: categoryId,
        name: newCategory,
        questions: []
      }
    ]);

    setNewCategory('');
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQs Manager</h1>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="faqs">Manage FAQs</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faqs">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Select 
                    value={newQuestion.categoryId} 
                    onValueChange={(value) => setNewQuestion({...newQuestion, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    placeholder="Question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  />
                </div>
                <div>
                  <Textarea 
                    placeholder="Answer"
                    rows={5}
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.categoryId || !newQuestion.question || !newQuestion.answer}
                  className="bg-teal hover:bg-teal-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          {categories.map(category => (
            <Card key={category.id} className="mb-6">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.questions.map(q => (
                    <div key={q.id} className="border rounded-md p-4">
                      {editingQuestion && editingQuestion.questionId === q.id ? (
                        <div className="space-y-4">
                          <Input 
                            value={editingQuestion.question}
                            onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                          />
                          <Textarea 
                            rows={5}
                            value={editingQuestion.answer}
                            onChange={(e) => setEditingQuestion({...editingQuestion, answer: e.target.value})}
                          />
                          <div className="flex space-x-2">
                            <Button onClick={handleSaveQuestion} size="sm" className="bg-green-500 hover:bg-green-600">
                              <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                            <Button onClick={() => setEditingQuestion(null)} size="sm" variant="outline">
                              <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">{q.question}</h3>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditQuestion(category.id, q.id, q.question, q.answer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteQuestion(category.id, q.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600">{q.answer}</p>
                        </>
                      )}
                    </div>
                  ))}
                  {category.questions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No FAQs in this category yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="categories">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input 
                  placeholder="Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCategory}
                  className="bg-teal hover:bg-teal-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.questions.length} FAQs</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FAQsManager;
